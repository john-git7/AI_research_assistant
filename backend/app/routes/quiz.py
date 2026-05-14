"""
POST /quiz — MCQ generation via LangGraph.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import QuizRequest, QuizResponse, QuizQuestion
from app.agents.router import run_workflow

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post("", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    """
    Generate multiple-choice questions from document content.
    Returns structured questions with options, correct answer, and explanation.
    """
    state = {
        "intent": "quiz",
        "document_ids": request.document_ids,
        "num_questions": request.num_questions,
        "difficulty": request.difficulty.value,
        "topic": request.topic,
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

    raw_questions = result.get("questions", [])
    if not raw_questions:
        raise HTTPException(
            status_code=422,
            detail="Could not generate questions from the provided documents. "
                   "Try with documents containing more content.",
        )

    questions = [QuizQuestion(**q) for q in raw_questions]
    return QuizResponse(
        questions=questions,
        document_ids=result.get("document_ids", request.document_ids),
        difficulty=request.difficulty,
    )
