"""
Embedding layer: singleton SentenceTransformer wrapper.
Keeps model in memory across requests for efficiency.
"""
import threading
from typing import Optional

from app.config.settings import settings

_lock = threading.Lock()
_model = None  # Lazy singleton


def _get_model():
    """Thread-safe lazy initialisation of the embedding model."""
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                try:
                    from sentence_transformers import SentenceTransformer
                    _model = SentenceTransformer(settings.EMBEDDING_MODEL)
                except ImportError as exc:
                    raise ImportError(
                        "sentence-transformers is required. "
                        "Install with: pip install sentence-transformers"
                    ) from exc
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Embed a batch of texts.
    Returns a list of float vectors (one per input text).
    """
    model = _get_model()
    embeddings = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    """Embed a single query string."""
    return embed_texts([query])[0]
