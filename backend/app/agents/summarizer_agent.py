"""
Summarizer Agent: generates concise / detailed / bullet-point summaries
from retrieved document chunks. Uses only the retrieved context.
"""
from app.agents.base_agent import BaseAgent
from app.rag.retriever import retrieve, format_context
from app.utils.text_utils import truncate_text

SUMMARY_PROMPTS = {
    "concise": """You are a document summarisation expert.
Write a concise 2-3 paragraph summary of the document context below.
Focus only on the most important information.
Do NOT add information not present in the context.

Context:
{context}

Concise Summary:""",

    "detailed": """You are a document summarisation expert.
Write a comprehensive, detailed summary of the document context below.
Cover all key points, arguments, data, and conclusions present in the context.
Do NOT add information not present in the context.

Context:
{context}

Detailed Summary:""",

    "bullets": """You are a document summarisation expert.
Summarise the document context below as a structured bullet-point list.
Each bullet should capture one distinct key point.
Use clear, direct language. Aim for 6-12 bullets.
Do NOT add information not present in the context.

Context:
{context}

Bullet-Point Summary:""",
}


class SummarizerAgent(BaseAgent):
    """Generates document summaries at various levels of detail."""

    def run(self, state: dict) -> dict:
        document_ids = state.get("document_ids", [])
        summary_type = state.get("summary_type", "concise")
        topic = state.get("topic")
        top_k = state.get("top_k", 10)  # Summaries benefit from more context

        # Use topic as query if provided; otherwise generic broad query
        query = topic if topic else "main topics key findings conclusions summary"

        chunks = retrieve(query=query, document_ids=document_ids, top_k=top_k)
        state["retrieved_chunks"] = chunks

        if not chunks:
            state["result"] = {
                "summary": "No content could be retrieved from the specified documents.",
                "summary_type": summary_type,
                "sources": [],
            }
            return state

        context = format_context(chunks)
        prompt_template = SUMMARY_PROMPTS.get(summary_type, SUMMARY_PROMPTS["concise"])
        prompt = prompt_template.format(context=context)
        summary = self._call_llm(prompt)

        # Build deduplicated sources
        sources = []
        seen = set()
        for chunk in chunks:
            meta = chunk.get("metadata", {})
            doc = meta.get("source", "unknown")
            page = int(meta.get("page", 1))
            key = (doc, page)
            if key not in seen:
                seen.add(key)
                sources.append({
                    "document": doc,
                    "page": page,
                    "chunk": truncate_text(chunk.get("text", ""), max_chars=150),
                })

        state["result"] = {
            "summary": summary,
            "summary_type": summary_type,
            "sources": sources,
        }
        return state
