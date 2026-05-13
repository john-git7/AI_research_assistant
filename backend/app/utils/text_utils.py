"""
Text cleaning and normalisation utilities used across parsing and agents.
"""
import re
import unicodedata


def clean_text(text: str) -> str:
    """
    Normalise unicode, collapse whitespace, and strip non-printable characters.
    Preserves paragraph structure via double newlines.
    """
    # Normalise unicode characters (e.g. smart quotes → straight)
    text = unicodedata.normalize("NFKC", text)

    # Remove null bytes and other control characters except newlines/tabs
    text = re.sub(r"[^\S\n\t ]+", " ", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Collapse multiple spaces to one
    text = re.sub(r" {2,}", " ", text)

    # Collapse more than two consecutive newlines to two
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def truncate_text(text: str, max_chars: int = 300) -> str:
    """Return a truncated preview of text ending at a word boundary."""
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    # Back-track to last space for clean word boundary
    last_space = truncated.rfind(" ")
    if last_space > max_chars // 2:
        truncated = truncated[:last_space]
    return truncated + "…"


def extract_json_block(text: str) -> str:
    """
    Pull out the first JSON array or object from a markdown-wrapped LLM response.
    Handles ```json ... ``` fences.
    """
    # Strip markdown code fence
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```", "", text)

    # Find first [ or { to start of JSON
    for start_char in ("[", "{"):
        idx = text.find(start_char)
        if idx != -1:
            return text[idx:].strip()
    return text.strip()
