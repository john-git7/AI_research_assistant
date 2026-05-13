"""
Comparison Agent: retrieves chunks from two documents and surfaces
similarities, differences, topic overlaps, and contradictions.
"""
from app.agents.base_agent import BaseAgent
from app.rag.retriever import retrieve, format_context

COMPARE_PROMPT = """You are an expert document analyst.
You are given content from two separate documents below.
Your task is to compare them carefully and return a structured analysis.

STRICT RULES:
- Base your analysis ONLY on the provided document content.
- Do NOT fabricate similarities or differences not present in the text.
- Be specific and cite relevant points from each document.

Document A ({doc_a_name}):
{context_a}

---

Document B ({doc_b_name}):
{context_b}

{focus_instruction}

Provide your analysis in the following EXACT format (use these exact headers):

SIMILARITIES:
- <point>
- <point>

DIFFERENCES:
- <point>
- <point>

TOPIC OVERLAP:
- <shared topic>
- <shared topic>

CONTRADICTIONS:
- <contradiction or "None found">

SUMMARY:
<2-3 sentence overall comparison summary>
"""


class ComparisonAgent(BaseAgent):
    """Compares two documents and returns structured analysis."""

    def run(self, state: dict) -> dict:
        doc_id_a = state.get("document_id_a", "")
        doc_id_b = state.get("document_id_b", "")
        focus_topic = state.get("topic")
        top_k = 8

        if not doc_id_a or not doc_id_b:
            state["error"] = "Two document IDs are required for comparison."
            return state

        if doc_id_a == doc_id_b:
            state["error"] = "Cannot compare a document with itself."
            return state

        query = focus_topic if focus_topic else "main topics key arguments conclusions"

        chunks_a = retrieve(query=query, document_ids=[doc_id_a], top_k=top_k)
        chunks_b = retrieve(query=query, document_ids=[doc_id_b], top_k=top_k)

        state["retrieved_chunks"] = chunks_a + chunks_b

        if not chunks_a or not chunks_b:
            missing = []
            if not chunks_a:
                missing.append(doc_id_a)
            if not chunks_b:
                missing.append(doc_id_b)
            state["result"] = {
                "document_a": doc_id_a,
                "document_b": doc_id_b,
                "similarities": [],
                "differences": [],
                "topic_overlap": [],
                "contradictions": [],
                "summary": f"No content retrieved for document(s): {', '.join(missing)}",
            }
            return state

        # Extract filenames for display
        doc_a_name = chunks_a[0]["metadata"].get("source", doc_id_a) if chunks_a else doc_id_a
        doc_b_name = chunks_b[0]["metadata"].get("source", doc_id_b) if chunks_b else doc_id_b

        context_a = format_context(chunks_a)
        context_b = format_context(chunks_b)
        focus_instruction = f"Focus your comparison on: {focus_topic}" if focus_topic else ""

        prompt = COMPARE_PROMPT.format(
            doc_a_name=doc_a_name,
            doc_b_name=doc_b_name,
            context_a=context_a,
            context_b=context_b,
            focus_instruction=focus_instruction,
        )

        raw = self._call_llm(prompt)
        parsed = self._parse_comparison(raw)

        state["result"] = {
            "document_a": doc_a_name,
            "document_b": doc_b_name,
            **parsed,
        }
        return state

    def _parse_comparison(self, raw: str) -> dict:
        """Parse structured LLM output into comparison result dict."""
        sections = {
            "similarities": [],
            "differences": [],
            "topic_overlap": [],
            "contradictions": [],
            "summary": "",
        }

        section_map = {
            "SIMILARITIES:": "similarities",
            "DIFFERENCES:": "differences",
            "TOPIC OVERLAP:": "topic_overlap",
            "CONTRADICTIONS:": "contradictions",
            "SUMMARY:": "summary",
        }

        current_section = None
        for line in raw.splitlines():
            stripped = line.strip()
            if not stripped:
                continue

            matched = False
            for header, key in section_map.items():
                if stripped.upper().startswith(header):
                    current_section = key
                    matched = True
                    break

            if matched:
                continue

            if current_section == "summary":
                sections["summary"] += (" " + stripped) if sections["summary"] else stripped
            elif current_section and stripped.startswith("-"):
                point = stripped.lstrip("- ").strip()
                if point and point.lower() != "none found":
                    sections[current_section].append(point)

        return sections
