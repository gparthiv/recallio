from fastapi import FastAPI, HTTPException
from rag.pipeline import ingest_content
from ai import format_content, generate_metadata
from schemas import (
    AutofillRequest,
    AutofillResponse,
    FormatRequest,
    FormatResponse,
)
from rag.retrieval import retrieve_chunks
from rag.pipeline import answer_question
from bson import ObjectId
from pymongo import MongoClient
import os

app = FastAPI(
    title="Synapse AI Service",
    version="0.1.0",
)

@app.get("/rag/debug-mongodb")
def debug_mongodb():
    try:
        mongodb_uri = os.getenv("MONGODB_URI")
        content_db_name = "test"

        if not mongodb_uri:
            raise RuntimeError("MONGODB_URI is not configured")

        client = MongoClient(mongodb_uri)
        db = client[mongodb_db]

        collections = db.list_collection_names()

        contents_count = db["contents"].count_documents({})

        sample = db["contents"].find_one(
            {},
            {
                "_id": 1,
                "title": 1,
                "type": 1,
            },
        )

        return {
            "database": mongodb_db,
            "collections": collections,
            "contentsCount": contents_count,
            "sampleContent": (
                {
                    "_id": str(sample["_id"]),
                    "title": sample.get("title"),
                    "type": sample.get("type"),
                }
                if sample
                else None
            ),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@app.post("/rag/ingest")
def rag_ingest(payload: dict):
    try:
        content_id = payload["contentId"]
        user_id = payload["userId"]
        title = payload["title"]
        content_type = payload["contentType"]

        source_url = payload.get("sourceUrl")
        body = payload.get("body")

        inserted_ids = ingest_content(
            content_id=content_id,
            user_id=user_id,
            title=title,
            content_type=content_type,
            source_url=source_url,
            body=body,
        )

        return {
            "success": True,
            "contentId": content_id,
            "chunksInserted": len(inserted_ids),
            "chunkIds": inserted_ids,
        }

    except ValueError as error:
        # Unsupported content / extraction failure.
        return {
            "success": False,
            "contentId": payload.get("contentId"),
            "chunksInserted": 0,
            "message": str(error),
        }

    except Exception as error:
        print("RAG ingestion error:", error)

        raise HTTPException(
            status_code=500,
            detail="RAG ingestion failed",
        )

@app.post("/rag/chat")
def rag_chat(payload: dict):
    try:
        question = payload["question"]
        user_id = payload["userId"]

        result = answer_question(
            question=question,
            user_id=user_id,
            limit=5,
        )

        return {
            "success": True,
            **result,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "synapse-ai",
    }


@app.post(
    "/format",
    response_model=FormatResponse,
)
def format_endpoint(
    request: FormatRequest,
):
    try:
        return format_content(request)

    except Exception as error:
        print("Formatting error:", error)

        raise HTTPException(
            status_code=500,
            detail="AI formatting failed",
        )


@app.post(
    "/autofill",
    response_model=AutofillResponse,
)
def autofill_endpoint(
    request: AutofillRequest,
):
    try:
        return generate_metadata(request)

    except Exception as error:
        print("Autofill error:", error)

        raise HTTPException(
            status_code=500,
            detail="AI autofill failed",
        )

@app.delete("/rag/content/{content_id}")
def delete_rag_content(content_id: str):
    try:
        if not ObjectId.is_valid(content_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid contentId",
            )

        from rag.vector_store import delete_rag_chunks

        deleted_count = delete_rag_chunks(
            content_id
        )

        return {
            "success": True,
            "contentId": content_id,
            "chunksDeleted": deleted_count,
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            "RAG deletion error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="RAG deletion failed",
        )

@app.put("/rag/content/{content_id}")
def update_rag_content(
    content_id: str,
    payload: dict,
):
    try:
        if not ObjectId.is_valid(content_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid contentId",
            )

        from rag.vector_store import delete_rag_chunks

        delete_rag_chunks(content_id)

        inserted_ids = ingest_content(
            content_id=content_id,
            user_id=payload["userId"],
            title=payload["title"],
            content_type=payload["contentType"],
            source_url=payload.get("sourceUrl"),
            body=payload.get("body"),
        )

        return {
            "success": True,
            "contentId": content_id,
            "chunksInserted": len(inserted_ids),
        }

    except HTTPException:
        raise

    except ValueError as error:
        return {
            "success": False,
            "contentId": content_id,
            "chunksInserted": 0,
            "message": str(error),
        }

    except Exception as error:
        print(
            "RAG update error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="RAG update failed",
        )