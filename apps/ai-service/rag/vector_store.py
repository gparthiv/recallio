import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGO_DB", "synapse")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not configured")


client = MongoClient(MONGODB_URI)

db = client[MONGODB_DB]

rag_chunks_collection = db["rag_chunks"]


VECTOR_INDEX_NAME = "rag_vector_index"


def insert_rag_chunk(chunk: dict) -> str:
    """
    Insert one RAG chunk into MongoDB.
    """

    result = rag_chunks_collection.insert_one(chunk)

    return str(result.inserted_id)

def has_rag_chunks(content_id: str) -> bool:
    return rag_chunks_collection.count_documents(
        {"contentId": content_id},
        limit=1,
    ) > 0

def delete_rag_chunks(content_id: str) -> int:
    result = rag_chunks_collection.delete_many(
        {
            "contentId": content_id,
        }
    )

    return result.deleted_count

def search_similar_chunks(
    query_embedding: list[float],
    user_id: str,
    limit: int = 5,
) -> list[dict]:
    """
    Search for semantically similar chunks belonging
    only to the specified user.
    """

    pipeline = [
        {
            "$vectorSearch": {
                "index": VECTOR_INDEX_NAME,
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": max(limit * 10, 50),
                "limit": limit,
                "filter": {
                    "userId": user_id
                },
            }
        },
        {
            "$project": {
                "_id": 1,
                "contentId": 1,
                "userId": 1,
                "text": 1,
                "chunkIndex": 1,
                "totalChunks": 1,
                "contentType": 1,
                "title": 1,
                "sourceUrl": 1,
                "score": {
                    "$meta": "vectorSearchScore"
                },
            }
        },
    ]


    # Convert MongoDB ObjectId values into strings
    results = list(
        rag_chunks_collection.aggregate(pipeline)
    )

    for result in results:
        result["_id"] = str(result["_id"])
        result["contentId"] = str(result["contentId"])
        result["userId"] = str(result["userId"])
        result["score"] = float(result["score"])

    return results


    