```python
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

    try:
        pages = extractor.extract(pdf_bytes)
    except Exception as e:
        logger.error("Error extracting PDF: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error extracting PDF."
        )

    logger.info("Extracted %s pages.", len(pages))

    # ------------------------------------------------------
    # Clean
    # ------------------------------------------------------

    logger.info("Cleaning pages...")

    try:
        cleaned_pages = cleaner.clean_pages(pages)
    except Exception as e:
        logger.error("Error cleaning pages: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error cleaning pages."
        )

    logger.info("Cleaning completed.")

    # ------------------------------------------------------
    # Chunk
    # ------------------------------------------------------

    logger.info("Creating chunks...")

    try:
        chunks = chunker.chunk_pages(cleaned_pages)
    except Exception as e:
        logger.error("Error chunking pages: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error chunking pages."
        )

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

    try:
        embeddings = embedder.embed_batch(chunks)
    except Exception as e:
        logger.error("Error generating embeddings: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error generating embeddings."
        )

    logger.info("Generated %s embeddings.", len(embeddings))

    # ------------------------------------------------------
    # Vector DB
    # ------------------------------------------------------

    logger.info("Uploading vectors to Pinecone...")

    try:
        vectordb.upsert_chunks(
            pdf_name=pdf_name,
            chunks=chunks,
            embeddings=embeddings,
        )
    except Exception as e:
        logger.error("Error uploading vectors to Pinecone: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error uploading vectors to Pinecone."
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

    try:
        pdfs = vectordb.list_pdf_names()
    except Exception as e:
        logger.error("Error fetching uploaded PDFs: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error fetching uploaded PDFs."
        )

    logger.info("Found %d PDFs.", len(pdfs))

    return {
        "success": True,
        "count": len(pdfs),
        "pdfs": pdfs
    }



@app.post("/chat")
async def chat(query: str):
 
    logger.info("=" * 70)
    logger.info("Question : %s", query)
 
    # ------------------------------------------------------
    # Embed Query
    # ------------------------------------------------------
 
    logger.info("Generating query embedding...")
 
    try:
        query_embedding = embedder.embed_query(query)
    except Exception as e:
        logger.error("Error generating query embedding: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error generating query embedding."
        )

    logger.info("Embedding generated.")
 
    # ------------------------------------------------------
    # Semantic Search
    # ------------------------------------------------------
 
    logger.info("Searching Pinecone...")
 
    try:
        results = vectordb.search(
            embedding=query_embedding,
            top_k=5,
        )
    except Exception as e:
        logger.error("Error searching Pinecone: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error searching Pinecone."
        )

    matches = results.get("matches", [])
 
    logger.info("Retrieved %s documents.", len(matches))
 
    for m in matches:
        logger.info(
            "  score=%.4f  pdf=%s  page=%s",
            m["score"],
            m.get("metadata", {}).get("pdf"),
            m.get("metadata", {}).get("page"),
        )
 
    # ------------------------------------------------------
    # Use all matches from semantic search directly, no score filtering
    # ------------------------------------------------------
 
    relevant_matches = matches
 
    if len(relevant_matches) == 0:
 
        logger.info("No matches at all (index may be empty) — returning PDF-only response.")
 
        answer = (
            "I'm here to answer questions only about the uploaded PDF documents "
            "and the policies they contain. I can't respond to general conversations "
            "or unrelated questions. Please ask a question related to the uploaded "
            "PDF or policy document."
        )
 
        return {
            "success": True,
            "question": query,
            "answer": answer,
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
respond: "I'm here to answer questions only about the uploaded PDF documents and the policies they contain. I can't respond to general conversations or unrelated questions. Please ask a question related to the uploaded PDF or policy document."
 
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
 
    try:
        answer = llm.generate(prompt)
    except Exception as e:
        logger.error("Error calling Ollama LLM: %s", str(e))
        raise HTTPException(
            status_code=500,
            detail="Error calling Ollama LLM."
        )

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
        host="