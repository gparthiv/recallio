def chunk_text(
    text: str,
    chunk_size: int = 3000,
    overlap: int = 300,
) -> list[str]:
    """
    Split text into overlapping chunks.

    chunk_size and overlap are measured in characters for the MVP.

    We use character-based chunking initially because it is simple
    and dependency-free. We can replace this with token-aware and
    code-aware chunking later.
    """

    if not text or not text.strip():
        return []

    text = text.strip()

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - overlap

    return chunks