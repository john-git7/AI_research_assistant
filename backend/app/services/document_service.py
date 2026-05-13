"""
Document ingestion service: orchestrates parse → chunk → embed → store pipeline.
Also maintains an in-memory registry of uploaded documents for the session.
"""
from pathlib import Path
from typing import Optional

from app.rag.parser import parse_document
from app.rag.chunker import chunk_documents
from app.rag.vector_store import add_documents, delete_document
from app.utils.file_utils import list_uploaded_files, get_file_path

# In-memory document registry (document_id → metadata dict)
# For production, replace with a lightweight SQLite or Redis store.
_document_registry: dict[str, dict] = {}


def ingest_document(file_path: Path, document_id: str) -> dict:
    """
    Full ingestion pipeline for a single document.

    Steps:
    1. Parse file → list[Document] with page metadata
    2. Chunk documents → smaller overlapping chunks
    3. Embed and store in ChromaDB

    Returns a metadata dict with ingestion stats.
    """
    # Parse
    raw_docs = parse_document(file_path, document_id)
    if not raw_docs:
        raise ValueError(f"No text could be extracted from '{file_path.name}'.")

    # Chunk
    chunks = chunk_documents(raw_docs)
    if not chunks:
        raise ValueError(f"Chunking produced no output for '{file_path.name}'.")

    # Embed + Store
    num_stored = add_documents(chunks)

    metadata = {
        "document_id": document_id,
        "filename": file_path.name,
        "pages": len(raw_docs),
        "chunks_created": num_stored,
        "file_type": file_path.suffix.lstrip("."),
    }

    # Register
    _document_registry[document_id] = metadata
    return metadata


def get_document_metadata(document_id: str) -> Optional[dict]:
    """Return registry metadata for a document, or None if unknown."""
    return _document_registry.get(document_id)


def list_documents() -> list[dict]:
    """
    Return all known documents.
    Falls back to scanning the upload directory if the registry is empty
    (e.g. after a server restart).
    """
    if _document_registry:
        return list(_document_registry.values())

    # Rebuild partial info from disk
    files = list_uploaded_files()
    return [
        {
            "document_id": f["document_id"],
            "filename": f["filename"],
            "pages": None,
            "chunks_created": None,
            "file_type": f["extension"],
        }
        for f in files
    ]


def remove_document(document_id: str) -> int:
    """Delete a document from the vector store, registry, and on-disk storage."""
    deleted = delete_document(document_id)
    _document_registry.pop(document_id, None)
    try:
        file_path = get_file_path(document_id)
        file_path.unlink(missing_ok=True)
    except Exception:
        pass
    return deleted
