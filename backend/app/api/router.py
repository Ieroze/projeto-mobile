from fastapi import APIRouter
from app.api.system import router as system_router
from app.api.cats import router as cats_router
api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(cats_router, prefix="/api/v1")
