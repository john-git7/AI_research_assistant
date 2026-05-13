"""
Document parser: PDF (via PyMuPDF) and plain-text loader.
Returns a list of LangChain Document objects with page-level metadata.
"""
from pathlib import Path
from typing import Optional

from langchain.schema import Document

from app.utils.text_utils import clean_text


def parse_pdf(file_path: Path, document_id: str) -> list[Document]:
    """
    Extract text from a PDF file, one Document per page.
    Requires: pymupdf (import fitz)
    """
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:
        raise ImportError("PyMuPDF is required. Install with: pip install pymupdf") from exc

    documents: list[Document] = []
    pdf = fitz.open(str(file_path))

    for page_num in range(len(pdf)):
        page = pdf[page_num]
        raw_text = page.get_text("text")
        cleaned = clean_text(raw_text)

        if not cleaned:
            continue  # Skip blank pages

        documents.append(
            Document(
                page_content=cleaned,
                metadata={
                    "document_id": document_id,
                    "source": file_path.name,
                    "page": page_num + 1,  # 1-based
                    "total_pages": len(pdf),
                    "file_type": "pdf",
                },
            )
        )

    pdf.close()
    return documents


def parse_txt(file_path: Path, document_id: str) -> list[Document]:
    """
    Load a plain-text file as a single Document (page=1).
    Handles common encodings gracefully.
    """
    for encoding in ("utf-8", "latin-1", "cp1252"):
        try:
            raw_text = file_path.read_text(encoding=encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        raw_text = file_path.read_bytes().decode("utf-8", errors="replace")

    cleaned = clean_text(raw_text)

    return [
        Document(
            page_content=cleaned,
            metadata={
                "document_id": document_id,
                "source": file_path.name,
                "page": 1,
                "total_pages": 1,
                "file_type": "txt",
            },
        )
    ]


def parse_document(file_path: Path, document_id: str) -> list[Document]:
    """
    Dispatcher: choose parser based on file extension.
    Returns list[Document] with populated metadata.
    """
    ext = file_path.suffix.lower().lstrip(".")
    if ext == "pdf":
        return parse_pdf(file_path, document_id)
    elif ext == "txt":
        return parse_txt(file_path, document_id)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")
