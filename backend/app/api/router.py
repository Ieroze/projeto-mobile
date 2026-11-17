from fastapi import APIRouter
from app.api.system import router as system_router
from app.api.cats import admin_router as admin_cats_router, router as cats_router
from app.api.partners import router as partners_router
from app.api.campaigns import router as campaigns_router
from app.api.guide import router as guide_router
from app.api.adoptions import router as adoptions_router
from app.api.cat_admin_resources import router as cat_admin_resources_router
from app.api.medications import router as medications_router
api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(cats_router, prefix="/api/v1")
api_router.include_router(admin_cats_router, prefix="/api/v1")
api_router.include_router(partners_router, prefix="/api/v1")
api_router.include_router(campaigns_router, prefix="/api/v1")
api_router.include_router(guide_router, prefix="/api/v1")
api_router.include_router(adoptions_router, prefix="/api/v1")
api_router.include_router(cat_admin_resources_router, prefix="/api/v1")
api_router.include_router(medications_router, prefix="/api/v1")
