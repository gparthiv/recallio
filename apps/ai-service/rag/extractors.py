from typing import Any

from rag.extraction import extract_content_text
from rag.youtube import extract_youtube_transcript
from rag.web import extract_webpage


SUPPORTED_TYPES = {
    "note",
    "youtube",
    "link",
    "amazon",
    "flipkart",
}


def extract_for_content(
    *,
    content_type: str,
    url: str | None,
    title: str,
    body: Any = None,
) -> str | None:
    """
    Convert saved Synapse content into text that can be
    chunked and embedded for RAG.

    Supported:
    - note
    - youtube
    - link
    - amazon
    - flipkart

    Unsupported content types return None.
    """

    # -----------------------------------------
    # 1. Notes
    # -----------------------------------------
    if content_type == "note":
        text = extract_content_text(
            body=body,
        )

        return text or None

    # -----------------------------------------
    # 2. YouTube
    # -----------------------------------------
    if content_type == "youtube":
        if not url:
            return None

        return extract_youtube_transcript(url)

    # -----------------------------------------
    # 3. Generic webpage
    # -----------------------------------------
    if content_type == "link":
        if not url:
            return None

        return extract_webpage(url)

    # -----------------------------------------
    # 4. Amazon
    # -----------------------------------------
    if content_type == "amazon":
        title = title.strip()

        if not title:
            return None

        return title

    # -----------------------------------------
    # 5. Flipkart
    # -----------------------------------------
    if content_type == "flipkart":
        title = title.strip()

        if not title:
            return None

        return title

    # -----------------------------------------
    # 6. Unsupported content type
    # -----------------------------------------
    return None