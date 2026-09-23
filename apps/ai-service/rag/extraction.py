from typing import Any


def extract_text_from_tiptap(node: Any) -> str:
    """
    Convert Tiptap JSON into readable plain text.

    We recursively walk through the document and collect
    text nodes while preserving useful line breaks.
    """

    if node is None:
        return ""

    if isinstance(node, list):
        parts = [extract_text_from_tiptap(item) for item in node]
        return "\n".join(part for part in parts if part.strip())

    if not isinstance(node, dict):
        return ""

    node_type = node.get("type")

    # Actual text node
    if node_type == "text":
        return node.get("text", "")

    # Hard break
    if node_type == "hardBreak":
        return "\n"

    children = node.get("content", [])

    child_text = []

    for child in children:
        text = extract_text_from_tiptap(child)

        if text:
            child_text.append(text)

    if not child_text:
        return ""

    # Block-level nodes should be separated
    block_nodes = {
        "paragraph",
        "heading",
        "blockquote",
        "codeBlock",
        "listItem",
        "bulletList",
        "orderedList",
    }

    separator = "\n" if node_type in block_nodes else ""

    return separator.join(child_text)


def extract_content_text(
    body: Any = None,
    selected_text: str | None = None,
    plain_text: str | None = None,
) -> str:
    """
    Convert Synapse content into a single text representation.

    Priority:

    1. selected text
    2. plain text
    3. Tiptap body
    """

    if selected_text and selected_text.strip():
        return selected_text.strip()

    if plain_text and plain_text.strip():
        return plain_text.strip()

    if body:
        text = extract_text_from_tiptap(body)

        if text.strip():
            return text.strip()

    return ""