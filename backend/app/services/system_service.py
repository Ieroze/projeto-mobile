from app.core.config import settings

def get_health_status() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}
