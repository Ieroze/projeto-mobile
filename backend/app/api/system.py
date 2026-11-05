from fastapi import APIRouter
from app.controllers.system_controller import health
router = APIRouter(tags=["system"])
router.add_api_route("/health", health, methods=["GET"])
