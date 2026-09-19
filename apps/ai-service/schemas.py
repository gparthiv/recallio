from typing import Any
from pydantic import BaseModel, Field


class FormatRequest(BaseModel):
    text: str
    html: str | None = None
    page_title: str | None = None
    source_url: str | None = None

class TiptapDocument(BaseModel):
    type: str
    content: list[dict[str, Any]]


class FormatResponse(BaseModel):
    document: TiptapDocument


class AutofillRequest(BaseModel):
    text: str
    page_title: str | None = None
    source_url: str | None = None
    content_type: str | None = None


class AutofillResponse(BaseModel):
    title: str