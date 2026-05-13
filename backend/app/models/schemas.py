"""
Pydantic models for request validation and response serialisation.
Every FastAPI endpoint uses these models — no raw dicts in route handlers.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


# ── Shared ────────────────────────────────────────────────────────────────────

class Source(BaseModel):
    """A single retrieved chunk used as a citation."""
    document: str = Field(..., description="Filename of the source document")
    page: int = Field(..., description="1-based page number")
    chunk: str = Field(..., description="Preview of the retrieved text chunk")


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    message: str
    document_id: str
    filename: str
    pages: int
    chunks_created: int


# ── Ask ───────────────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)
    document_ids: list[str] = Field(
        default=[],
        description="Limit retrieval to these document IDs; empty = all docs",
    )
    top_k: Optional[int] = Field(default=5, ge=1, le=20)


class AskResponse(BaseModel):
    answer: str
    sources: list[Source]


# ── Summary ───────────────────────────────────────────────────────────────────

class SummaryType(str, Enum):
    concise = "concise"
    detailed = "detailed"
    bullets = "bullets"


class SummaryRequest(BaseModel):
    document_ids: list[str] = Field(..., min_length=1)
    summary_type: SummaryType = SummaryType.concise
    query: Optional[str] = Field(
        default=None,
        description="Optional focus topic for the summary",
    )


class SummaryResponse(BaseModel):
    summary: str
    summary_type: SummaryType
    sources: list[Source]


# ── Quiz ──────────────────────────────────────────────────────────────────────

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class QuizRequest(BaseModel):
    document_ids: list[str] = Field(..., min_length=1)
    num_questions: int = Field(default=5, ge=1, le=20)
    difficulty: DifficultyLevel = DifficultyLevel.medium
    topic: Optional[str] = Field(default=None, description="Focus topic for quiz questions")


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(..., min_length=4, max_length=4)
    answer: str
    explanation: str


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]
    document_ids: list[str]
    difficulty: DifficultyLevel


# ── Compare ───────────────────────────────────────────────────────────────────

class CompareRequest(BaseModel):
    document_id_a: str
    document_id_b: str
    focus_topic: Optional[str] = Field(
        default=None,
        description="Optional topic to focus the comparison on",
    )


class CompareResponse(BaseModel):
    document_a: str
    document_b: str
    similarities: list[str]
    differences: list[str]
    topic_overlap: list[str]
    contradictions: list[str]
    summary: str


# ── LangGraph State ───────────────────────────────────────────────────────────

class AgentState(BaseModel):
    """Shared state passed through the LangGraph workflow."""
    intent: Literal["qa", "summary", "quiz", "compare", "research"] = "qa"
    question: Optional[str] = None
    document_ids: list[str] = []
    top_k: int = 5
    summary_type: Optional[SummaryType] = None
    num_questions: int = 5
    difficulty: Optional[DifficultyLevel] = None
    topic: Optional[str] = None
    document_id_a: Optional[str] = None
    document_id_b: Optional[str] = None
    retrieved_chunks: list[dict] = []
    result: Optional[dict] = None
    error: Optional[str] = None
