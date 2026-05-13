"""
ChromaDB vector store wrapper.
Handles collection creation, document upsert, and semantic search.
"""
import uuid
from typing import Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_core.documents import Document


from app.config.settings import settings
from app.rag.embedder import embed_texts, embed_query


# ── Singleton client ──────────────────────────────────────────────────────────

_client: Optional[chromadb.PersistentClient] = None
_collection = None


def _get_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=settings.CHROMA_DB_PATH,
        )
    return _client


def _get_collection():
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


# ── Public API ────────────────────────────────────────────────────────────────

def add_documents(chunks: list[Document]) -> int:
    """
    Embed and upsert a list of Document chunks into ChromaDB.
    Returns the number of chunks stored.
    Skips empty-content chunks silently.
    """
    collection = _get_collection()

    valid_chunks = [c for c in chunks if c.page_content.strip()]
    if not valid_chunks:
        return 0

    texts = [c.page_content for c in valid_chunks]
    embeddings = embed_texts(texts)

    ids = [str(uuid.uuid4()) for _ in valid_chunks]
    metadatas = []
    for c in valid_chunks:
        meta = {k: (str(v) if not isinstance(v, (str, int, float, bool)) else v)
                for k, v in c.metadata.items()}
        metadatas.append(meta)

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )
    return len(valid_chunks)


def similarity_search(
    query: str,
    k: int = 5,
    document_ids: Optional[list[str]] = None,
) -> list[dict]:
    """
    Perform cosine-similarity search against the collection.
    Optionally filter to specific document_ids.
    Returns a list of dicts with keys: text, metadata, distance.
    """
    collection = _get_collection()
    query_embedding = embed_query(query)

    where_filter = None
    if document_ids:
        if len(document_ids) == 1:
            where_filter = {"document_id": {"$eq": document_ids[0]}}
        else:
            where_filter = {"document_id": {"$in": document_ids}}

    kwargs = dict(
        query_embeddings=[query_embedding],
        n_results=min(k, collection.count() or 1),
        include=["documents", "metadatas", "distances"],
    )
    if where_filter:
        kwargs["where"] = where_filter

    results = collection.query(**kwargs)

    chunks = []
    if results and results["documents"]:
        for text, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            chunks.append(
                {
                    "text": text,
                    "metadata": meta,
                    "distance": dist,
                }
            )
    return chunks


def delete_document(document_id: str) -> int:
    """Remove all chunks for a given document_id from the collection."""
    collection = _get_collection()
    results = collection.get(where={"document_id": {"$eq": document_id}})
    if results and results["ids"]:
        collection.delete(ids=results["ids"])
        return len(results["ids"])
    return 0


def collection_count() -> int:
    """Return the total number of stored chunks."""
    return _get_collection().count()
