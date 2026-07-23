import logging
import os
import shutil
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from modules.extractor import PDFExtractor
from modules.cleaner import TextCleaner
from modules.chunker import TextChunker
from modules.embedder import Embedder
from modules.vectordb import PineconeDB
from modules.llm import LLM

load_dotenv()

# ==========================================================
# Logging
# ==========================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
)

logger = logging.getLogger(__name__)

# ==========================================================
# FastAPI
# ==========================================================

app = FastAPI(
    title="PDF RAG API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to your actual origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Initialize Services
# ==========================================================

logger.info("Initializing services...")

extractor = PDFExtractor()
cleaner = TextCleaner()
chunker = TextChunker()
embedder = Embedder()

vectordb = PineconeDB(
    api_key=os.getenv("PINECONE_API_KEY"),
    index_name=os.getenv("PINECONE_INDEX"),
)

llm = LLM()

logger.info("All services initialized.")

# ==========================================================
# Home
# ==========================================================


@app.get("/")
def home():
    logger.info("Home endpoint called.")

    return {
        "message": "Welcome Home 🚀",
        "status": "Running"
    }


# ==========================================================
# Upload PDF
# ==========================================================


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    logger.info("=" * 70)
    logger.info("Upload request received.")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    pdf_name = Path(file.filename).stem

    logger.info("Reading PDF into memory: %s", file.filename)

    pdf_bytes = await file.read()

    logger.info("Read %d bytes.", len(pdf_bytes))

    # ------------------------------------------------------
    # Extract
    # ------------------------------------------------------

    logger.info("Extracting PDF...")

    pages = extractor.extract(pdf_bytes)

    logger.info("Extracted %s pages.", len(pages))

    # ------------------------------------------------------
    # Clean
    # ------------------------------------------------------

    logger.info("Cleaning pages...")

    cleaned_pages = cleaner.clean_pages(pages)

    logger.info("Cleaning completed.")

    # ------------------------------------------------------
    # Chunk
    # ------------------------------------------------------

    logger.info("Creating chunks...")

    chunks = chunker.chunk_pages(cleaned_pages)

    logger.info("Created %s chunks.", len(chunks))

    if len(chunks) == 0:
        raise HTTPException(
            status_code=400,
            detail="No text found in PDF."
        )

    # ------------------------------------------------------
    # Embeddings
    # ------------------------------------------------------

    logger.info("Generating embeddings...")

    embeddings = embedder.embed_batch(chunks)

    logger.info("Generated %s embeddings.", len(embeddings))

    # ------------------------------------------------------
    # Vector DB
    # ------------------------------------------------------

    logger.info("Uploading vectors to Pinecone...")

    vectordb.upsert_chunks(
        pdf_name=pdf_name,
        chunks=chunks,
        embeddings=embeddings,
    )

    logger.info("Vectors uploaded successfully.")

    logger.info("Upload completed.")
    logger.info("=" * 70)

    return JSONResponse({
        "success": True,
        "pdf": file.filename,
        "pages": len(pages),
        "chunks": len(chunks),
        "vectors": len(embeddings),
    })
# ==========================================================
# get pdfs
# ==========================================================

@app.get("/pdfs")
async def get_uploaded_pdfs():

    logger.info("Fetching uploaded PDFs...")

    pdfs = vectordb.list_pdf_names()

    logger.info("Found %d PDFs.", len(pdfs))

    return {
        "success": True,
        "count": len(pdfs),
        "pdfs": pdfs
    }



# ==========================================================
# Chat
# ==========================================================
 
# Matches below this cosine-similarity score are treated as "not relevant" —
# tune this per your embedding model (0.3-0.4 is a reasonable starting point
# for nemotron-3-embed on short policy-doc chunks; raise it if you still see
# irrelevant matches, lower it if real answers get filtered out).
RELEVANCE_THRESHOLD = 0.35
 
 
@app.post("/chat")
async def chat(query: str):
 
    logger.info("=" * 70)
    logger.info("Question : %s", query)
 
    # ------------------------------------------------------
    # Embed Query
    # ------------------------------------------------------
 
    logger.info("Generating query embedding...")
 
    query_embedding = embedder.embed_query(query)
 
    logger.info("Embedding generated.")
 
    # ------------------------------------------------------
    # Semantic Search
    # ------------------------------------------------------
 
    logger.info("Searching Pinecone...")
 
    results = vectordb.search(
        embedding=query_embedding,
        top_k=5,
    )
 
    matches = results.get("matches", [])
 
    logger.info("Retrieved %s documents.", len(matches))
 
    # ------------------------------------------------------
    # Filter out irrelevant matches (Pinecone always returns *something*,
    # even for greetings like "hi" — a low score means "closest available",
    # not "actually relevant")
    # ------------------------------------------------------
 
    relevant_matches = [m for m in matches if m["score"] >= RELEVANCE_THRESHOLD]
 
    logger.info(
        "%s of %s matches passed the relevance threshold (%.2f).",
        len(relevant_matches), len(matches), RELEVANCE_THRESHOLD
    )
 
    if len(relevant_matches) == 0:
        return {
            "success": True,
            "question": query,
            "answer": "Hi! Ask me anything about your uploaded documents and I'll do my best to help.",
            "sources": []
        }
 
    # ------------------------------------------------------
    # Build Context (dedupe chunks from the same pdf+page so the same
    # source doesn't get pulled into context twice)
    # ------------------------------------------------------
 
    context = ""
    sources = []
    seen_pages = set()
 
    for match in relevant_matches:
 
        metadata = match["metadata"]
 
        context += f"""
PDF : {metadata['pdf']}
Page : {metadata['page']}
 
{metadata['text']}
 
----------------------------------------
"""
 
        page_key = (metadata["pdf"], metadata["page"])
        if page_key not in seen_pages:
            seen_pages.add(page_key)
            sources.append({
                "pdf": metadata["pdf"],
                "page": metadata["page"],
                "score": round(match["score"], 4)
            })
 
    # ------------------------------------------------------
    # Prompt
    # ------------------------------------------------------
 
    prompt = f"""
You are an AI assistant.
 
Answer ONLY from the given context.
 
If the answer is not available in the context,
say you don't know.
 
Context:
 
{context}
 
Question:
 
{query}
 
Answer:
"""
 
    # ------------------------------------------------------
    # LLM
    # ------------------------------------------------------
 
    logger.info("Calling Ollama LLM...")
 
    answer = llm.generate(prompt)
 
    logger.info("LLM response generated.")
    logger.info("=" * 70)
 
    return {
        "success": True,
        "question": query,
        "answer": answer,
        "sources": sources
    }
# ==========================================================
# Run
# ==========================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )