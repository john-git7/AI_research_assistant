"""
POST /ask — Question answering with citations via LangGraph.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import AskRequest, AskResponse, Source
from app.agents.router import run_workflow

router = APIRouter(prefix="/ask", tags=["Q&A"])


@router.post("", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Ask a question about uploaded documents.
    Returns a grounded answer with source citations.
    If the answer is not in the documents, returns a clear 'not found' message.
    """
    state = {
        "intent": "qa",
        "question": request.question,
        "document_ids": request.document_ids or [],
        "top_k": request.top_k or 5,
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

    sources = [Source(**s) for s in result.get("sources", [])]
    return AskResponse(answer=result.get("answer", ""), sources=sources)
