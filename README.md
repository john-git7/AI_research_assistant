# AI Research Assistant

A production-style Retrieval-Augmented Generation (RAG) system for students and professionals.  
Upload documents → Ask questions → Get cited answers → Generate summaries, quizzes, and comparisons.

---
## Team Information

**Team Name:** Team Bishop

**Partner 1:** John Ebenezer

**Partner 2:** Gukesh

---
## Architecture

```
Frontend (React + Tailwind)
    ↓  Axios
FastAPI Backend
    ↓
Document Processing  →  PyMuPDF / txt loader
    ↓
Chunking            →  RecursiveCharacterTextSplitter (1000 / 200)
    ↓
Embeddings          →  sentence-transformers/all-MiniLM-L6-v2
    ↓
ChromaDB            →  Persistent vector store
    ↓
LangGraph Router    →  intent-based dispatch
    ↓
Specialized Agents  →  Citation / Summarizer / Quiz / Comparison / Research
    ↓
Gemini 1.5 Flash    →  Grounded, citation-backed responses
```

---

## Features

| Feature | Endpoint | Agent |
|---------|----------|-------|
| Document upload (PDF/TXT) | `POST /upload` | — |
| Citation Q&A | `POST /ask` | CitationAgent |
| Document summary | `POST /summary` | SummarizerAgent |
| MCQ quiz generation | `POST /quiz` | QuizAgent |
| Document comparison | `POST /compare` | ComparisonAgent |
| Health check | `GET /health` | — |

---

## Quick Start

### 1. Clone

```bash
git clone <your-repo-url>
cd ai-research-assistant
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env — set your GEMINI_API_KEY

# Run
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# VITE_API_URL=http://localhost:8000

# Run
npm run dev
```

App: http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | **required** |
| `GEMINI_MODEL` | Model name | `gemini-1.5-flash` |
| `CHROMA_DB_PATH` | ChromaDB persistence path | `./chroma_db` |
| `CHROMA_COLLECTION_NAME` | Collection name | `research_assistant` |
| `UPLOAD_DIR` | Upload directory | `./uploads` |
| `MAX_FILE_SIZE_MB` | Max upload size | `50` |
| `CHUNK_SIZE` | Text chunk size | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap | `200` |
| `RETRIEVAL_TOP_K` | Chunks retrieved per query | `5` |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL |

---

## API Reference

### `POST /upload`
Upload a PDF or TXT document.

**Form Data:** `file` (multipart)

**Response:**
```json
{
  "message": "Document uploaded and indexed successfully.",
  "document_id": "sample_abc123",
  "filename": "sample.pdf",
  "pages": 12,
  "chunks_created": 45
}
```

---

### `POST /ask`
Ask a question about documents.

**Request:**
```json
{
  "question": "What is the main argument of the paper?",
  "document_ids": ["sample_abc123"],
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "The main argument is...",
  "sources": [
    { "document": "sample.pdf", "page": 3, "chunk": "The author argues..." }
  ]
}
```

---

### `POST /summary`
Generate a document summary.

**Request:**
```json
{
  "document_ids": ["sample_abc123"],
  "summary_type": "concise",
  "query": "methodology"
}
```
`summary_type`: `concise` | `detailed` | `bullets`

---

### `POST /quiz`
Generate MCQs from document content.

**Request:**
```json
{
  "document_ids": ["sample_abc123"],
  "num_questions": 5,
  "difficulty": "medium",
  "topic": "climate change"
}
```
`difficulty`: `easy` | `medium` | `hard`

**Response:**
```json
{
  "questions": [
    {
      "question": "What year did...?",
      "options": ["A. 1990", "B. 2001", "C. 2010", "D. 2020"],
      "answer": "C. 2010",
      "explanation": "The document states on page 4..."
    }
  ],
  "difficulty": "medium"
}
```

---

### `POST /compare`
Compare two uploaded documents.

**Request:**
```json
{
  "document_id_a": "doc1_abc",
  "document_id_b": "doc2_def",
  "focus_topic": "methodology"
}
```

---

### `GET /health`
Check API health and vector store stats.

---

## Deployment

### Backend → Render

1. Push `backend/` to a GitHub repository.
2. Create a new **Web Service** on Render.
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`.

### Frontend → Vercel

1. Push `frontend/` to GitHub.
2. Import into Vercel.
3. Set `VITE_API_URL` to your Render backend URL.
4. Deploy.

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app factory
│   ├── config/settings.py       # Env-var configuration
│   ├── models/schemas.py        # Pydantic request/response models
│   ├── routes/
│   │   ├── upload.py            # POST /upload
│   │   ├── ask.py               # POST /ask
│   │   ├── summary.py           # POST /summary
│   │   ├── quiz.py              # POST /quiz
│   │   └── compare.py           # POST /compare
│   ├── agents/
│   │   ├── base_agent.py        # Abstract base + Gemini client
│   │   ├── citation_agent.py    # Grounded Q&A with citations
│   │   ├── summarizer_agent.py  # Multi-mode summarisation
│   │   ├── quiz_agent.py        # Structured MCQ generation
│   │   ├── comparison_agent.py  # Document diff analysis
│   │   ├── research_agent.py    # Enhanced Q&A
│   │   └── router.py            # LangGraph workflow
│   ├── rag/
│   │   ├── parser.py            # PDF + TXT parsing
│   │   ├── chunker.py           # Text splitting
│   │   ├── embedder.py          # SentenceTransformer
│   │   ├── vector_store.py      # ChromaDB wrapper
│   │   └── retriever.py        # Query → chunks
│   ├── services/
│   │   └── document_service.py  # Ingestion orchestration
│   └── utils/
│       ├── file_utils.py        # File validation + saving
│       └── text_utils.py        # Text cleaning + JSON parsing
├── uploads/                     # Uploaded files
├── chroma_db/                   # Vector store persistence
├── requirements.txt
├── .env.example
└── render.yaml

frontend/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Document list + upload
│   │   ├── UploadZone.jsx       # Drag-and-drop upload
│   │   ├── ChatArea.jsx         # Q&A message thread
│   │   ├── SummaryPanel.jsx     # Summary generation
│   │   ├── QuizPanel.jsx        # MCQ cards
│   │   ├── ComparePanel.jsx     # Document comparison
│   │   └── CitationCard.jsx     # Collapsible citation
│   ├── pages/Dashboard.jsx      # Main layout
│   ├── hooks/useDocuments.js    # Document state hook
│   ├── services/api.js          # Axios API layer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

---

## Hallucination Prevention

Every agent uses a strict prompt rule:

> "Answer ONLY from the provided context. If the answer is not found, respond: **Information not found in document.**"

This is enforced at the prompt level in every agent, not as an optional feature.

---

## Getting a Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Add it to `backend/.env` as `GEMINI_API_KEY=your_key_here`
