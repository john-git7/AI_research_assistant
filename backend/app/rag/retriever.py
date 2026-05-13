"""
High-level retriever: bridges query → vector store → structured results.
"""
from typing import Optional

from app.rag.vector_store import similarity_search
from app.config.settings import settings


def retrieve(
    query: str,
    document_ids: Optional[list[str]] = None,
    top_k: Optional[int] = None,
) -> list[dict]:
    """
    Retrieve the top-k most relevant chunks for a query.

    Args:
        query: Natural-language question or topic.
        document_ids: Optional list of document IDs to restrict search scope.
        top_k: Number of chunks to retrieve (defaults to settings.RETRIEVAL_TOP_K).

    Returns:
        List of chunk dicts with keys: text, metadata, distance.
    """
    k = top_k if top_k is not None else settings.RETRIEVAL_TOP_K
    chunks = similarity_search(query=query, k=k, document_ids=document_ids or [])
    return chunks


def format_context(chunks: list[dict]) -> str:
    """
    Format retrieved chunks into a single numbered context string for LLM prompts.
    Each chunk is preceded by its source reference for traceability.
    """
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        meta = chunk.get("metadata", {})
        source = meta.get("source", "unknown")
        page = meta.get("page", "?")
        text = chunk.get("text", "")
        parts.append(f"[Source {i}: {source}, Page {page}]\n{text}")
    return "\n\n---\n\n".join(parts)
