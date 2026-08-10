import os
import requests
from dotenv import load_dotenv

load_dotenv()


class LLM:

    def __init__(
        self,
        model: str = "gpt-oss:120b",
        host: str = "https://ollama.com",
    ):
        self.model = model
        self.host = host.rstrip("/")
        self.api_key = os.getenv("OLLAMA_API_KEY")

        if not self.api_key:
            raise ValueError("OLLAMA_API_KEY not found.")

    def generate(self, prompt: str) -> str:

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "stream": False,
        }

        response = requests.post(
            f"{self.host}/api/chat",
            headers=headers,
            json=payload,
            timeout=300,
        )

        response.raise_for_status()

        return response.json()["message"]["content"]