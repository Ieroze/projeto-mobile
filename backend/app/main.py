from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(title=settings.app_name, version="0.2.0")


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    """Endpoint minimo para validar que o servidor iniciou."""
    return {"status": "ok", "environment": settings.app_env}


# Os endpoints de dominio nao foram implementados de proposito.
# O contrato inicial esta em ../docs/API_CONTRACT_DRAFT.md.
