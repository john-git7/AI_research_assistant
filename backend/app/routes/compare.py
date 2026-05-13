"""
POST /compare — Document comparison via LangGraph.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import CompareRequest, CompareResponse
from app.agents.router import run_workflow

router = APIRouter(prefix="/compare", tags=["Compare"])


@router.post("", response_model=CompareResponse)
async def compare_documents(request: CompareRequest):
    """
    Compare two uploaded documents.
    Returns similarities, differences, topic overlaps, and contradictions.
    """
    if request.document_id_a == request.document_id_b:
        raise HTTPException(
            status_code=400, detail="Cannot compare a document with itself."
        )

    state = {
        "intent": "compare",
        "document_id_a": request.document_id_a,
        "document_id_b": request.document_id_b,
        "topic": request.focus_topic,
        "document_ids": [request.document_id_a, request.document_id_b],
    }

    try:
        result_state = run_workflow(state)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Workflow error: {exc}")

    if result_state.get("error"):
        raise HTTPException(status_code=400, detail=result_state["error"])

    result = result_state.get("result", {})
    if not result:
        raise HTTPException(status_code=500, detail="Agent produced no result.")

    return CompareResponse(**result)
