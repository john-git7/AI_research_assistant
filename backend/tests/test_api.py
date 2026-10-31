import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config.settings import settings


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_intentional_ci_failure():
    assert 1 == 2

def test_health_check(client):
    """Test the health check endpoint returns 200 and standard response keys."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"
    assert "vector_db" in data
    assert "total_chunks" in data


def test_openapi_schema():
    """Verify that the FastAPI OpenAPI schema is generated and all routes are present."""
    schema = app.openapi()
    assert schema["info"]["title"] == "AI Research Assistant API"
    paths = schema.get("paths", {})
    assert "/health" in paths
    assert "/upload" in paths
    assert "/ask" in paths
    assert "/summary" in paths
    assert "/quiz" in paths
    assert "/compare" in paths


def test_settings_defaults():
    """Verify default application settings are properly loaded."""
    assert settings.GEMINI_MODEL == "gemini-1.5-flash"
    assert settings.CHUNK_SIZE > 0
    assert settings.RETRIEVAL_TOP_K > 0
    assert "pdf" in settings.ALLOWED_EXTENSIONS
