"""
Comparison Agent: retrieves chunks from multiple documents and surfaces
similarities, differences, topic overlaps, and contradictions.
"""
from app.agents.base_agent import BaseAgent
from app.rag.retriever import retrieve, format_context

COMPARE_PROMPT = """You are an expert document analyst.
You are given content from multiple documents below.
Your task is to compare them carefully and return a structured analysis.

STRICT RULES:
- Base your analysis ONLY on the provided document content.
- Do NOT fabricate similarities or differences not present in the text.
- Be specific and cite relevant points from each document.

DOCUMENTS CONTENT:
{formatted_contexts}

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
    """Compares multiple documents and returns structured analysis."""

    def run(self, state: dict) -> dict:
        doc_ids = state.get("document_ids", [])
        focus_topic = state.get("topic")
        top_k = 6

        if not doc_ids:
            state["error"] = "At least one document ID is required for analysis."
            return state

        query = focus_topic if focus_topic else "main topics key arguments conclusions"
        
        all_chunks = []
        formatted_contexts = ""
        
        for doc_id in doc_ids:
            chunks = retrieve(query=query, document_ids=[doc_id], top_k=top_k)
            if chunks:
                all_chunks.extend(chunks)
                doc_name = chunks[0]["metadata"].get("source", doc_id)
                formatted_contexts += f"\nDOCUMENT: {doc_name}\n{format_context(chunks)}\n---\n"

        state["retrieved_chunks"] = all_chunks

        if not all_chunks:
            state["result"] = {
                "document_ids": doc_ids,
                "similarities": [],
                "differences": [],
                "topic_overlap": [],
                "contradictions": [],
                "summary": "No content retrieved for the selected documents.",
                "comparison": "No content available for comparison."
            }
            return state

        focus_instruction = f"Focus your comparison on: {focus_topic}" if focus_topic else ""

        prompt = COMPARE_PROMPT.format(
            formatted_contexts=formatted_contexts,
            focus_instruction=focus_instruction,
        )

        raw = self._call_llm(prompt)
        parsed = self._parse_comparison(raw)

        # Generate a full Markdown report for the frontend
        comparison_markdown = f"# Comparative Analysis Report\n\n"
        
        if parsed["similarities"]:
            comparison_markdown += "## Similarities\n" + "\n".join([f"- {s}" for s in parsed["similarities"]]) + "\n\n"
        
        if parsed["differences"]:
            comparison_markdown += "## Differences\n" + "\n".join([f"- {d}" for d in parsed["differences"]]) + "\n\n"
            
        if parsed["topic_overlap"]:
            comparison_markdown += "## Topic Overlap\n" + "\n".join([f"- {t}" for t in parsed["topic_overlap"]]) + "\n\n"
            
        if parsed["contradictions"]:
            comparison_markdown += "## Contradictions\n" + "\n".join([f"- {c}" for c in parsed["contradictions"]]) + "\n\n"
            
        comparison_markdown += f"## Executive Summary\n{parsed['summary']}"

        state["result"] = {
            "document_ids": doc_ids,
            **parsed,
            "comparison": comparison_markdown
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
