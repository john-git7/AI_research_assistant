"""
POST /summary — Document summarisation via LangGraph.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import SummaryRequest, SummaryResponse, Source
from app.agents.router import run_workflow

router = APIRouter(prefix="/summary", tags=["Summary"])


@router.post("", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate a summary of one or more documents.
    Supports concise, detailed, and bullet-point formats.
    """
    state = {
        "intent": "summary",
        "document_ids": request.document_ids,
        "summary_type": request.summary_type.value,
        "topic": request.query,
        "top_k": 10,
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

    sources = [Source(**s) for s in result.get("sources", [])]
    return SummaryResponse(
        summary=result.get("summary", ""),
        summary_type=request.summary_type,
        sources=sources,
    )
