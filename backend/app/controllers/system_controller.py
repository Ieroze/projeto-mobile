from app.services.system_service import get_health_status

def health() -> dict[str, str]:
    return get_health_status()
