import os

from dotenv import load_dotenv
from pymongo import MongoClient

from rag.pipeline import ingest_content
from rag.vector_store import has_rag_chunks


load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not configured"
    )


client = MongoClient(MONGODB_URI)

source_db = client["test"]
contents_collection = source_db["contents"]


def main():
    contents = contents_collection.find({})

    total = 0
    successful = 0
    skipped = 0
    failed = 0

    for content in contents:
        total += 1

        content_id = str(content["_id"])
        user_id = str(content["userId"])

        title = content.get("title", "")
        content_type = content.get("type", "")
        source_url = content.get("link")
        body = content.get("body")

        print()
        print("=" * 70)
        print(f"Content: {title}")
        print(f"Type: {content_type}")
        print(f"ID: {content_id}")

        # -----------------------------------------
        # Skip content that is already indexed
        # -----------------------------------------
        if has_rag_chunks(content_id):
            print("SKIPPED: already indexed")
            skipped += 1
            continue

        try:
            chunk_ids = ingest_content(
                content_id=content_id,
                user_id=user_id,
                title=title,
                content_type=content_type,
                source_url=source_url,
                body=body,
            )

            successful += 1

            print(
                f"SUCCESS: inserted "
                f"{len(chunk_ids)} chunks"
            )

        except ValueError as error:
            skipped += 1

            print(
                f"SKIPPED: {error}"
            )

        except Exception as error:
            failed += 1

            print(
                f"FAILED: {error}"
            )

    print()
    print("=" * 70)
    print("INGESTION COMPLETE")
    print("=" * 70)

    print(f"Total:      {total}")
    print(f"Successful: {successful}")
    print(f"Skipped:    {skipped}")
    print(f"Failed:     {failed}")


if __name__ == "__main__":
    main()