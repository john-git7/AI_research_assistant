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
    Compare multiple uploaded documents.
    Returns similarities, differences, topic overlaps, and contradictions.
    """
    state = {
        "intent": "compare",
        "document_ids": request.document_ids,
        "topic": request.focus_topic,
    }

    try:
        result_state = run_workflow(state)
    except Exception as exc:
        msg = str(exc).lower()
        if "429" in msg or "quota exceeded" in msg:
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded: {exc}")
        raise HTTPException(status_code=500, detail=f"Workflow error: {exc}")

    if result_state.get("error"):
        raise HTTPException(status_code=400, detail=result_state["error"])

    result = result_state.get("result", {})
    if not result:
        raise HTTPException(status_code=500, detail="Agent produced no result.")

    return CompareResponse(**result)
