from pinecone import Pinecone


class PineconeDB:

    def __init__(
        self,
        api_key: str,
        index_name: str,
    ):

        self.pc = Pinecone(api_key=api_key)

        self.index = self.pc.Index(index_name)

    def upsert_chunks(
        self,
        pdf_name: str,
        chunks: list,
        embeddings: list,
    ):

        vectors = []

        for chunk, embedding in zip(chunks, embeddings):

            vectors.append({

                "id": f"{pdf_name}_{chunk['chunk_id']}",

                "values": embedding,

                "metadata": {
                    "pdf": pdf_name,
                    "page": chunk["page"],
                    "lines": chunk.get("lines", "unknown"),
                    "chunk_id": chunk["chunk_id"],
                    "text": chunk["text"]
                }

            })

        self.index.upsert(vectors=vectors)

        print(f"Stored {len(vectors)} vectors.")

    def search(
        self,
        embedding: list,
        top_k: int = 5,
    ):
        """
        Semantic search against Pinecone. Returns a dict-like response
        with a 'matches' key, each match containing 'metadata' and 'score' —
        this is exactly the shape main.py's /chat endpoint expects.
        """

        response = self.index.query(
            vector=embedding,
            top_k=top_k,
            include_metadata=True,
        )

        # newer pinecone-client versions return a dict-like QueryResponse,
        # but we normalize to a plain dict here so `.get("matches", [])`
        # in main.py always works regardless of client version.
        if hasattr(response, "to_dict"):
            return response.to_dict()

        return dict(response)

    def list_pdf_names(self):
        pdf_names = set()
        pagination_token = None

        while True:
            response = self.index.list_paginated(
                limit=100,
                pagination_token=pagination_token
            )

            for vector in getattr(response, "vectors", []):
                vector_id = getattr(vector, "id", None)
                if vector_id:
                    pdf_name = vector_id.rsplit("_", 1)[0]
                    pdf_names.add(pdf_name)

            pagination_token = getattr(response, "pagination_token", None)
            if not pagination_token:
                break

        return sorted(pdf_names)