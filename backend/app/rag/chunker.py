"""
Chunking layer: wraps LangChain's RecursiveCharacterTextSplitter.
All metadata from the source Document is preserved and propagated to chunks.
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


from app.config.settings import settings


def get_splitter() -> RecursiveCharacterTextSplitter:
    """Return a configured splitter instance."""
    return RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


def chunk_documents(documents: list[Document]) -> list[Document]:
    """
    Split a list of Documents into smaller chunks.
    Each chunk inherits the parent's metadata so page/source references survive.
    Also adds a `chunk_index` counter within each document.
    """
    splitter = get_splitter()
    chunks: list[Document] = []
    chunk_index = 0

    for doc in documents:
        split_docs = splitter.split_documents([doc])
        for i, chunk in enumerate(split_docs):
            # Inherit all parent metadata and add chunk-level fields
            chunk.metadata.update(
                {
                    "chunk_index": chunk_index,
                    "chunk_within_page": i,
                }
            )
            chunks.append(chunk)
            chunk_index += 1

    return chunks
