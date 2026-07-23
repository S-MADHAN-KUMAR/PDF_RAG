import os
from typing import List

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


class Embedder:
    def __init__(
        self,
        model: str = "nvidia/nemotron-3-embed-1b",
    ):
        self.client = OpenAI(
            api_key=os.getenv("NVIDIA_API_KEY"),
            base_url="https://integrate.api.nvidia.com/v1",
        )

        self.model = model

    def embed(self, text: str) -> List[float]:
        response = self.client.embeddings.create(
            model=self.model,
            input=text,
            extra_body={
                "input_type": "passage",
            },
        )

        return response.data[0].embedding

    def embed_batch(self, chunks: list[dict]) -> list[list[float]]:
        embeddings = []

        for chunk in chunks:
            response = self.client.embeddings.create(
                model=self.model,
                input=chunk["text"],
                extra_body={
                    "input_type": "passage",
                },
            )

            embeddings.append(response.data[0].embedding)

        return embeddings

    def embed_query(self, query: str) -> List[float]:
        response = self.client.embeddings.create(
            model=self.model,
            input=query,
            extra_body={
                "input_type": "query",
            },
        )

        return response.data[0].embedding