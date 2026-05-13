"""
FastAPI application factory.
Registers routers, configures CORS, and handles startup/shutdown events.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import upload, ask, summary, quiz, compare


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: pre-warm the embedding model to avoid cold-start on first request."""
    print("🚀 Starting AI Research Assistant...")
    try:
        from app.rag.embedder import embed_texts
        embed_texts(["warm up"])
        print("✅ Embedding model loaded.")
    except Exception as exc:
        print(f"⚠️  Embedding model warm-up failed: {exc}")

    try:
        from app.agents.router import get_graph
        get_graph()
        print("✅ LangGraph compiled.")
    except Exception as exc:
        print(f"⚠️  LangGraph compilation failed: {exc}")

    yield
    print("🛑 Shutting down...")


app = FastAPI(
    title="AI Research Assistant API",
    description=(
        "Production RAG system with multi-agent workflows for document Q&A, "
        "summarisation, quiz generation, and document comparison."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(upload.router)
app.include_router(ask.router)
app.include_router(summary.router)
app.include_router(quiz.router)
app.include_router(compare.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """Returns service health and basic stats."""
    from app.rag.vector_store import collection_count
    try:
        count = collection_count()
        db_status = "ok"
    except Exception:
        count = 0
        db_status = "error"

    return {
        "status": "ok",
        "version": "1.0.0",
        "vector_db": db_status,
        "total_chunks": count,
    }
