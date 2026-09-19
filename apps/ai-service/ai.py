import json
import os

from dotenv import load_dotenv
from google import genai

from schemas import (
    AutofillRequest,
    AutofillResponse,
    FormatRequest,
    FormatResponse,
    TiptapDocument,
)

from prompts import (
    AUTOFILL_SYSTEM_PROMPT,
    FORMAT_SYSTEM_PROMPT,
)


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured"
    )

client = genai.Client(
    api_key=api_key
)


MODEL = "gemini-3.5-flash-lite"


def format_content(
    request: FormatRequest,
) -> FormatResponse:

    html_section = request.html or ""

    prompt = f"""
{FORMAT_SYSTEM_PROMPT}

PAGE TITLE:
{request.page_title or ""}

SOURCE URL:
{request.source_url or ""}

SOURCE CONTENT:

{html_section if html_section else request.text}

IMPORTANT:
- If HTML is provided, treat the HTML as the authoritative source.
- Do not duplicate information merely because it appears in
  multiple representations.
- Preserve the information contained in the source.
- Use the HTML structure as a strong signal for headings,
  paragraphs, lists, links and formatting.

Return ONLY valid JSON.

The JSON must have this exact top-level structure:

{{
  "type": "doc",
  "content": []
}}

The content array must contain valid Tiptap nodes.

Do not wrap the JSON in markdown code fences.
"""

    interaction = client.interactions.create(
        model=MODEL,
        input=prompt,
    )

    output = interaction.output_text

    if not output:
        raise RuntimeError(
            "Gemini returned an empty response"
        )

    try:
        data = json.loads(output)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {error}"
        ) from error

    document = TiptapDocument.model_validate(data)

    return FormatResponse(
        document=document
    )


def generate_metadata(
    request: AutofillRequest,
) -> AutofillResponse:

    prompt = f"""
{AUTOFILL_SYSTEM_PROMPT}

PAGE TITLE:
{request.page_title or ""}

SOURCE URL:
{request.source_url or ""}

CONTENT TYPE:
{request.content_type or ""}

CONTENT:
{request.text}

Return ONLY valid JSON in this format:

{{
  "title": "A concise descriptive title"
}}

Do not wrap the JSON in markdown code fences.
"""

    interaction = client.interactions.create(
        model=MODEL,
        input=prompt,
    )

    output = interaction.output_text

    if not output:
        raise RuntimeError(
            "Gemini returned an empty response"
        )

    try:
        data = json.loads(output)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {error}"
        ) from error

    return AutofillResponse.model_validate(data)