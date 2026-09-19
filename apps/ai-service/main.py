from fastapi import FastAPI, HTTPException

from ai import format_content, generate_metadata
from schemas import (
    AutofillRequest,
    AutofillResponse,
    FormatRequest,
    FormatResponse,
)


app = FastAPI(
    title="Synapse AI Service",
    version="0.1.0",
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