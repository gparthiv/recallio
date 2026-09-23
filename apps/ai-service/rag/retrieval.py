from rag.embeddings import generate_embedding
from rag.vector_store import search_similar_chunks


DEFAULT_SCORE_THRESHOLD = 0.78


def retrieve_chunks(
    question: str,
    user_id: str,
    limit: int = 5,
    score_threshold: float = DEFAULT_SCORE_THRESHOLD,
) -> list[dict]:

    if not question.strip():
        return []

    query_embedding = generate_embedding(question)

    # Retrieve a few candidates from vector search.
    results = search_similar_chunks(
        query_embedding=query_embedding,
        user_id=user_id,
        limit=limit,
    )

    print("\n========== RAG RETRIEVAL DEBUG ==========")
    print("Question:", question)
    print("User ID:", user_id)
    print("Results before threshold:", len(results))

    for result in results:
        print(
            "Title:",
            result.get("title"),
            "| Score:",
            result.get("score"),
            "| Content ID:",
            result.get("contentId"),
            "| User ID:",
            result.get("userId"),
        )

    print("Score threshold:", score_threshold)

    relevant_results = [
        result
        for result in results
        if result.get("score", 0) >= score_threshold
    ]

    # Avoid sending too many weakly related candidates
    # to the generation model.
    relevant_results = relevant_results[:3]

    print(
        "Results after threshold:",
        len(relevant_results),
    )

    print("==========================================\n")

    return relevant_results