from typing import Any

from rag.chunking import chunk_text
from rag.embeddings import generate_embedding
from rag.extractors import extract_for_content
from rag.generation import generate_answer
from rag.retrieval import retrieve_chunks
from rag.vector_store import insert_rag_chunk


def ingest_content(
    *,
    content_id: str,
    user_id: str,
    title: str,
    content_type: str,
    source_url: str | None,
    body: Any = None,
    selected_text: str | None = None,
    plain_text: str | None = None,
) -> list[str]:
    """
    Convert one Synapse content item into RAG chunks
    and store them in MongoDB.
    """

    text = extract_for_content(
        content_type=content_type,
        url=source_url,
        title=title,
        body=body,
    )

    if not text:
        raise ValueError(
            "Could not extract any text from this content"
        )

    chunks = chunk_text(text)

    if not chunks:
        raise ValueError(
            "Text extraction succeeded but no chunks were created"
        )

    inserted_ids = []

    total_chunks = len(chunks)

    for index, chunk in enumerate(chunks):
        embedding = generate_embedding(chunk)

        document = {
            "contentId": content_id,
            "userId": user_id,
            "text": chunk,
            "embedding": embedding,
            "chunkIndex": index,
            "totalChunks": total_chunks,
            "contentType": content_type,
            "title": title,
            "sourceUrl": source_url,
        }

        inserted_id = insert_rag_chunk(document)

        inserted_ids.append(inserted_id)

    return inserted_ids


def group_results_by_content(
    results: list[dict],
) -> list[dict]:
    """
    Group multiple retrieved chunks belonging to the same
    Synapse content item into one source.

    This prevents one saved item from appearing multiple times
    as separate sources.
    """

    grouped = {}

    for result in results:
        content_id = result["contentId"]

        if content_id not in grouped:
            grouped[content_id] = {
                "contentId": content_id,
                "title": result.get(
                    "title",
                    "Untitled",
                ),
                "url": result.get(
                    "sourceUrl"
                ),
                "contentType": result.get(
                    "contentType"
                ),
                "chunks": [],
                "bestScore": result.get(
                    "score",
                    0,
                ),
            }

        grouped[content_id]["chunks"].append(
            result.get("text", "")
        )

        grouped[content_id]["bestScore"] = max(
            grouped[content_id]["bestScore"],
            result.get("score", 0),
        )

    return list(grouped.values())


def build_context(
    sources: list[dict],
) -> str:
    """
    Convert grouped sources into numbered context
    for Gemini.
    """

    if not sources:
        return ""

    context_parts = []

    for index, source in enumerate(
        sources,
        start=1,
    ):
        chunks = source.get("chunks", [])

        content = "\n\n".join(
            chunk
            for chunk in chunks
            if chunk.strip()
        )

        source_information = f"""
Source {index}
Title: {source.get("title", "Untitled")}
Type: {source.get("contentType", "unknown")}
URL: {source.get("url") or "No URL"}

Content:
{content}
"""

        context_parts.append(
            source_information.strip()
        )

    return "\n\n".join(context_parts)


def answer_question(
    *,
    question: str,
    user_id: str,
    limit: int = 5,
) -> dict:
    """
    Complete RAG pipeline:

    question
       ↓
    vector retrieval
       ↓
    group chunks into sources
       ↓
    build context
       ↓
    Gemini
       ↓
    answer + only used sources
    """

    results = retrieve_chunks(
        question=question,
        user_id=user_id,
        limit=limit,
    )

    if not results:
        return {
            "answer": (
                "I couldn't find relevant information about this "
                "in your saved Synapse knowledge."
            ),
            "sources": [],
            "foundInSynapse": False,
            "offerInternetSearch": True,
        }

    sources = group_results_by_content(results)

    context = build_context(sources)

    if not context:
        return {
            "answer": (
                "I couldn't find relevant information about this "
                "in your saved Synapse knowledge."
            ),
            "sources": [],
            "foundInSynapse": False,
            "offerInternetSearch": True,
        }

    generation_result = generate_answer(
        question=question,
        context=context,
    )

    answer = generation_result["answer"]
    found = generation_result["found"]
    used_source_numbers = generation_result["usedSources"]

    # Gemini determined that the retrieved content does not
    # actually answer the question.
    if not found or not used_source_numbers:
        return {
            "answer": answer,
            "sources": [],
            "foundInSynapse": False,
            "offerInternetSearch": True,
        }

    final_sources = []

    for source_number in used_source_numbers:

        index = source_number - 1

        if index < 0 or index >= len(sources):
            continue

        source = sources[index]

        final_sources.append(
            {
                "contentId": source["contentId"],
                "title": source["title"],
                "url": source["url"],
                "contentType": source["contentType"],
            }
        )

    # Safety check:
    # if Gemini claimed it found something but none of the
    # returned source numbers were valid, do not show sources.
    if not final_sources:
        return {
            "answer": answer,
            "sources": [],
            "foundInSynapse": False,
            "offerInternetSearch": True,
        }

    return {
        "answer": answer,
        "sources": final_sources,
        "foundInSynapse": True,
        "offerInternetSearch": False,
    }