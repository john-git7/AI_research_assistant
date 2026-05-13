"""
Citation Agent: retrieves relevant chunks and assembles a cited answer.
This is the primary agent for the /ask endpoint.
"""
from app.agents.base_agent import BaseAgent
from app.rag.retriever import retrieve, format_context
from app.utils.text_utils import truncate_text

CITATION_PROMPT = """You are a precise research assistant. Answer the user's question
using ONLY the information provided in the context below.

STRICT RULES:
- Do NOT use any knowledge outside the provided context.
- If the answer cannot be found in the context, respond EXACTLY with:
  "Information not found in document."
- Be factual, clear, and concise.
- Do NOT hallucinate facts, numbers, or citations.

Context:
{context}

Question: {question}

Answer:"""


class CitationAgent(BaseAgent):
    """Retrieves chunks and generates a grounded, citation-backed answer."""

    def run(self, state: dict) -> dict:
        question = state.get("question", "")
        document_ids = state.get("document_ids", [])
        top_k = state.get("top_k", 5)

        if not question:
            state["error"] = "No question provided."
            return state

        # Retrieve
        chunks = retrieve(query=question, document_ids=document_ids, top_k=top_k)
        state["retrieved_chunks"] = chunks

        if not chunks:
            state["result"] = {
                "answer": "Information not found in document.",
                "sources": [],
            }
            return state

        # Build context and call LLM
        context = format_context(chunks)
        prompt = CITATION_PROMPT.format(context=context, question=question)
        answer = self._call_llm(prompt)

        # Build source citations
        sources = []
        seen = set()
        for chunk in chunks:
            meta = chunk.get("metadata", {})
            doc = meta.get("source", "unknown")
            page = int(meta.get("page", 1))
            chunk_text = truncate_text(chunk.get("text", ""), max_chars=200)
            key = (doc, page)
            if key not in seen:
                seen.add(key)
                sources.append(
                    {
                        "document": doc,
                        "page": page,
                        "chunk": chunk_text,
                    }
                )

        state["result"] = {"answer": answer, "sources": sources}
        return state
