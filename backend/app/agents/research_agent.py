"""
Research Agent: enhanced QA with broader context retrieval.
Intentionally simple — no autonomous reasoning chains.
Retrieves more chunks than standard QA for richer, multi-faceted answers.
"""
from app.agents.base_agent import BaseAgent
from app.rag.retriever import retrieve, format_context
from app.utils.text_utils import truncate_text

RESEARCH_PROMPT = """You are a thorough research assistant.
Answer the following question in depth using ONLY the provided context.
Provide a well-structured response with clear reasoning.

STRICT RULES:
- Use ONLY information present in the context.
- If the answer is not in the context, say: "Information not found in document."
- Do NOT hallucinate. Do NOT add external knowledge.
- Structure your answer with clear paragraphs.

Context:
{context}

Research Question: {question}

Detailed Answer:"""


class ResearchAgent(BaseAgent):
    """
    Enhanced QA agent that retrieves a larger context window for
    more comprehensive answers. Suitable for complex, multi-part questions.
    """

    def run(self, state: dict) -> dict:
        question = state.get("question", "")
        document_ids = state.get("document_ids", [])
        top_k = min(state.get("top_k", 5) + 5, 15)  # Broader retrieval

        if not question:
            state["error"] = "No question provided."
            return state

        chunks = retrieve(query=question, document_ids=document_ids, top_k=top_k)
        state["retrieved_chunks"] = chunks

        if not chunks:
            state["result"] = {
                "answer": "Information not found in document.",
                "sources": [],
            }
            return state

        context = format_context(chunks)
        prompt = RESEARCH_PROMPT.format(context=context, question=question)
        answer = self._call_llm(prompt)

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
                    "chunk": truncate_text(chunk.get("text", ""), max_chars=200),
                })

        state["result"] = {"answer": answer, "sources": sources}
        return state
