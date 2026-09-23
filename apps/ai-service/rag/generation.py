import json
import os

from dotenv import load_dotenv
from google import genai


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


client = genai.Client(
    api_key=GEMINI_API_KEY
)


GENERATION_MODEL = "gemini-3.5-flash-lite"


SYSTEM_INSTRUCTION = """
You are Synapse AI, a personal knowledge assistant.

Your job is to answer questions using ONLY the information
provided in the retrieved Synapse context.

Rules:

1. Do not invent facts that are not present in the context.

2. Do not use outside knowledge to fill missing information.

3. If the retrieved context does not contain enough information
   to answer the question, say that the information was not found
   in the user's saved Synapse knowledge.

4. Give a concise but useful answer.

5. A retrieved source should only be considered USED if its content
   actually contributes information to answering the user's question.

6. Do not consider a source used merely because it is vaguely
   related to the question.

7. If none of the retrieved sources actually answer the question,
   return an empty usedSources list.

8. Never invent a source number.

9. Do not include a "Source", "Sources", "Source 1", or similar
   source section in the answer.

10. Return ONLY valid JSON.

The JSON must have exactly this structure:

{
  "answer": "your answer here",
  "found": true,
  "usedSources": [1, 2]
}

If the answer cannot be found:

{
  "answer": "I couldn't find relevant information about this in your saved Synapse knowledge.",
  "found": false,
  "usedSources": []
}

The numbers in usedSources correspond to the numbered sources
provided in the retrieved context.
"""


def generate_answer(
    question: str,
    context: str,
) -> dict:

    prompt = f"""
{SYSTEM_INSTRUCTION}

RETRIEVED SYNAPSE CONTEXT:

{context}

USER QUESTION:

{question}
"""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response"
        )

    raw_response = response.text.strip()

    # Handle accidental markdown code fences.
    if raw_response.startswith("```"):
        raw_response = raw_response.replace(
            "```json",
            "",
            1,
        ).replace(
            "```",
            "",
        ).strip()

    try:
        result = json.loads(raw_response)

    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {error}"
        )

    if not isinstance(result, dict):
        raise RuntimeError(
            "Gemini returned an invalid response format"
        )

    answer = result.get("answer")
    found = result.get("found")
    used_sources = result.get("usedSources")

    if not isinstance(answer, str):
        raise RuntimeError(
            "Gemini response is missing a valid answer"
        )

    if not isinstance(found, bool):
        raise RuntimeError(
            "Gemini response is missing a valid found value"
        )

    if not isinstance(used_sources, list):
        raise RuntimeError(
            "Gemini response is missing a valid usedSources list"
        )

    return {
        "answer": answer.strip(),
        "found": found,
        "usedSources": [
            int(source)
            for source in used_sources
            if isinstance(source, int)
        ],
    }