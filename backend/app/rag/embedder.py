"""
Embedding layer: uses Google Gemini native embeddings to eliminate local memory footprints
and bypass cloud deployment startup timeouts.
"""
import time
import google.generativeai as genai
from app.config.settings import settings

# Ensure GenAI is configured with your API key
genai.configure(api_key=settings.GEMINI_API_KEY)

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generates vectors for document chunks using Gemini API with batching and rate-limit handling."""
    if not texts:
        return []
    
    embeddings = []
    batch_size = 50  # Safely below the 100 requests/minute free tier quota
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        try:
            response = genai.embed_content(
                model="models/gemini-embedding-001",
                content=batch,
                task_type="retrieval_document"
            )
            embeddings.extend(response["embedding"])
        except Exception as exc:
            if "429" in str(exc) or "Quota" in str(exc):
                print("⚠️ Rate limit hit during embedding. Sleeping for 60 seconds before retrying...")
                time.sleep(60)
                response = genai.embed_content(
                    model="models/gemini-embedding-001",
                    content=batch,
                    task_type="retrieval_document"
                )
                embeddings.extend(response["embedding"])
            else:
                raise exc
        
        # If more batches remain, pause to adhere to the per-minute quota
        if i + batch_size < len(texts):
            print("⏳ Respecting Gemini API free tier rate limits: sleeping for 60 seconds before next batch...")
            time.sleep(60)
            
    return embeddings

def embed_query(query: str) -> list[float]:
    """Generates a single vector for the user search query."""
    try:
        response = genai.embed_content(
            model="models/gemini-embedding-001",
            content=query,
            task_type="retrieval_query"
        )
        return response["embedding"]
    except Exception as exc:
        if "429" in str(exc) or "Quota" in str(exc):
            print("⚠️ Rate limit hit on query embedding. Sleeping for 10 seconds...")
            time.sleep(10)
            response = genai.embed_content(
                model="models/gemini-embedding-001",
                content=query,
                task_type="retrieval_query"
            )
            return response["embedding"]
        raise exc
