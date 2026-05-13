"""
POST /upload — Accepts PDF/TXT files, runs ingestion pipeline.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from app.models.schemas import UploadResponse
from app.utils.file_utils import validate_file, save_upload
from app.services.document_service import ingest_document, list_documents, remove_document

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF or TXT document.
    Triggers the full parse → chunk → embed → store pipeline.
    Returns ingestion stats including pages and chunks created.
    """
    # Validate file extension before reading
    validate_file(file)

    try:
        document_id, file_path = await save_upload(file)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {exc}")

    try:
        metadata = ingest_document(file_path, document_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ingestion error: {exc}")

    return UploadResponse(
        message="Document uploaded and indexed successfully.",
        document_id=metadata["document_id"],
        filename=metadata["filename"],
        pages=metadata["pages"],
        chunks_created=metadata["chunks_created"],
    )


@router.get("/documents")
async def get_documents():
    """List all uploaded and indexed documents."""
    return {"documents": list_documents()}


@router.delete("/documents/{document_id}")
async def delete_document_endpoint(document_id: str):
    """Delete a document from the vector store, registry, and disk."""
    try:
        deleted_chunks = remove_document(document_id)
        return {"message": "Document deleted successfully", "deleted_chunks": deleted_chunks}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {exc}")
