import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured"
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)

EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSION = 768


def generate_embedding(
    text: str,
) -> list[float]:

    if not text.strip():
        raise ValueError(
            "Cannot generate embedding for empty text"
        )

    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text,
                config=types.EmbedContentConfig(
                    output_dimensionality=EMBEDDING_DIMENSION,
                ),
            )

            if not result.embeddings:
                raise RuntimeError(
                    "Gemini returned no embedding"
                )

            return result.embeddings[0].values

        except Exception as error:

            if attempt == max_attempts - 1:
                raise

            wait_seconds = 2 ** attempt

            print(
                f"Embedding request failed. "
                f"Retrying in {wait_seconds}s..."
            )

            time.sleep(wait_seconds)

    raise RuntimeError(
        "Embedding generation failed"
    )