from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers import medication_controller as controller
from app.core.config import settings
from app.db.database import get_db
from app.models.enums import MedicationStatus
from app.schemas.medication import MedicationRequestCreate, MedicationRequestAdminList, MedicationRequestAdminResponse, MedicationReceipt, MedicationStatusPatch


def require_development() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=404, detail="Not found")


router = APIRouter(tags=["medication-requests"], dependencies=[Depends(require_development)])
admin_router = APIRouter(prefix="/admin/medication-requests", tags=["medication-requests-admin"], dependencies=[Depends(require_development)])


@router.post("/medication-requests", response_model=MedicationReceipt, status_code=201)
def submit(payload: MedicationRequestCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.submit(db, payload)


@admin_router.get("", response_model=MedicationRequestAdminList)
def list_admin(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0, request_status: Annotated[MedicationStatus | None, Query(alias="status")] = None):
    return controller.list_admin(db, limit, offset, request_status)


@admin_router.get("/{request_id}", response_model=MedicationRequestAdminResponse)
def get_admin(request_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.get_admin(db, request_id)


@admin_router.patch("/{request_id}/status", response_model=MedicationRequestAdminResponse)
def patch_status(request_id: UUID, payload: MedicationStatusPatch, db: Annotated[Session, Depends(get_db)]):
    return controller.patch_status(db, request_id, payload.status, payload.internal_notes)


router.include_router(admin_router)
