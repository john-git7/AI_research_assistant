"""
Base agent: shared Gemini client initialisation and abstract interface.
All specialised agents inherit from this class.
"""
import abc
import google.generativeai as genai

from app.config.settings import settings


class BaseAgent(abc.ABC):
    """
    Abstract base for all LangGraph agent nodes.
    Subclasses implement `run(state: dict) -> dict`.
    """

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._model = genai.GenerativeModel(model_name=settings.GEMINI_MODEL)

    def _call_llm(self, prompt: str) -> str:
        """
        Send a prompt to Gemini and return the text response.
        Raises RuntimeError if the API call fails.
        """
        try:
            response = self._model.generate_content(prompt)
            return response.text.strip()
        except Exception as exc:
            raise RuntimeError(f"Gemini API error: {exc}") from exc

    @abc.abstractmethod
    def run(self, state: dict) -> dict:
        """
        Execute agent logic.
        Args:
            state: LangGraph shared state dict (see schemas.AgentState).
        Returns:
            Updated state dict with `result` populated.
        """
