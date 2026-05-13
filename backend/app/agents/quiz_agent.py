"""
Quiz Generator Agent: produces MCQ questions from document context.
Returns structured JSON-parseable output.
"""
import json

from app.agents.base_agent import BaseAgent
from app.rag.retriever import retrieve, format_context
from app.utils.text_utils import extract_json_block

QUIZ_PROMPT = """You are an expert quiz creator for academic and professional content.
Generate exactly {num_questions} multiple-choice questions (MCQs) from the context below.

Difficulty level: {difficulty}
{topic_instruction}

STRICT RULES:
- Each question must be answerable from the provided context only.
- Each question must have exactly 4 options labeled A, B, C, D.
- Exactly one option must be correct.
- Include a brief explanation for the correct answer.
- Do NOT fabricate facts not present in the context.
- Return ONLY a valid JSON array, no markdown, no extra text.

Context:
{context}

Return this exact JSON format:
[
  {{
    "question": "Question text here?",
    "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
    "answer": "A. option1",
    "explanation": "Brief explanation why this is correct."
  }}
]

JSON Output:"""


DIFFICULTY_INSTRUCTIONS = {
    "easy": "Focus on basic recall of facts and definitions directly stated in the context.",
    "medium": "Include application and comprehension questions requiring understanding of concepts.",
    "hard": "Include analysis questions requiring inference, comparison, and critical thinking from the context.",
}


class QuizAgent(BaseAgent):
    """Generates MCQs from retrieved document context."""

    def run(self, state: dict) -> dict:
        document_ids = state.get("document_ids", [])
        num_questions = state.get("num_questions", 5)
        difficulty = state.get("difficulty", "medium")
        topic = state.get("topic")
        top_k = min(num_questions * 2, 15)  # More context for more questions

        query = topic if topic else "key concepts important facts main ideas"
        chunks = retrieve(query=query, document_ids=document_ids, top_k=top_k)
        state["retrieved_chunks"] = chunks

        if not chunks:
            state["result"] = {
                "questions": [],
                "document_ids": document_ids,
                "difficulty": difficulty,
                "error": "No content retrieved. Cannot generate quiz.",
            }
            return state

        context = format_context(chunks)
        topic_instruction = f"Focus specifically on the topic: {topic}" if topic else ""
        difficulty_instruction = DIFFICULTY_INSTRUCTIONS.get(difficulty, DIFFICULTY_INSTRUCTIONS["medium"])

        prompt = QUIZ_PROMPT.format(
            num_questions=num_questions,
            difficulty=f"{difficulty} — {difficulty_instruction}",
            topic_instruction=topic_instruction,
            context=context,
        )

        raw_response = self._call_llm(prompt)
        questions = self._parse_questions(raw_response, num_questions)

        state["result"] = {
            "questions": questions,
            "document_ids": document_ids,
            "difficulty": difficulty,
        }
        return state

    def _parse_questions(self, raw: str, expected: int) -> list[dict]:
        """Parse LLM JSON output into a list of quiz question dicts."""
        try:
            json_str = extract_json_block(raw)
            questions = json.loads(json_str)
            # Validate structure
            validated = []
            for q in questions:
                if (
                    isinstance(q, dict)
                    and "question" in q
                    and "options" in q
                    and "answer" in q
                ):
                    validated.append({
                        "question": str(q["question"]),
                        "options": [str(o) for o in q.get("options", [])],
                        "answer": str(q["answer"]),
                        "explanation": str(q.get("explanation", "")),
                    })
            return validated[:expected]
        except (json.JSONDecodeError, ValueError, TypeError):
            # Fallback: return empty list rather than crashing
            return []
