"""
File utility helpers: validation, saving, and metadata extraction.
"""
import os
import uuid
import hashlib
from pathlib import Path
from fastapi import UploadFile, HTTPException

from app.config.settings import settings


ALLOWED_MIME_TYPES = {
    "pdf": "application/pdf",
    "txt": "text/plain",
}

MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


def validate_file(file: UploadFile) -> str:
    """
    Validate file extension and MIME type.
    Returns the detected extension.
    Raises HTTPException on invalid input.
    """
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )
    return ext


async def save_upload(file: UploadFile) -> tuple[str, Path]:
    """
    Read and persist the uploaded file to disk.
    Returns (document_id, absolute_path).
    Raises HTTPException if the file is too large.
    """
    content = await file.read()

    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB} MB",
        )

    # Deterministic ID based on file content hash + original name
    file_hash = hashlib.sha256(content).hexdigest()[:12]
    original_stem = Path(file.filename or "document").stem
    ext = validate_file_extension(file.filename or "")
    document_id = f"{original_stem}_{file_hash}"

    dest = Path(settings.UPLOAD_DIR) / f"{document_id}.{ext}"
    dest.write_bytes(content)

    return document_id, dest


def validate_file_extension(filename: str) -> str:
    """Return lowercase extension or raise ValueError."""
    if "." not in filename:
        raise HTTPException(status_code=400, detail="File has no extension.")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext}",
        )
    return ext


def list_uploaded_files() -> list[dict]:
    """Return metadata for all files in the upload directory."""
    upload_dir = Path(settings.UPLOAD_DIR)
    files = []
    for f in upload_dir.iterdir():
        if f.is_file() and f.suffix.lstrip(".") in settings.ALLOWED_EXTENSIONS:
            files.append(
                {
                    "document_id": f.stem,
                    "filename": f.name,
                    "size_bytes": f.stat().st_size,
                    "extension": f.suffix.lstrip("."),
                }
            )
    return files


def get_file_path(document_id: str) -> Path:
    """Resolve a document_id to its on-disk path. Raises 404 if missing."""
    upload_dir = Path(settings.UPLOAD_DIR)
    for ext in settings.ALLOWED_EXTENSIONS:
        candidate = upload_dir / f"{document_id}.{ext}"
        if candidate.exists():
            return candidate
    raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
