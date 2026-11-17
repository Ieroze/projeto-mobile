from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers import adoption_controller as controller
from app.core.config import settings
from app.db.database import get_db
from app.models.enums import ApplicationStatus
from app.schemas.adoption import (
    AdoptionApplicationAdminListResponse, AdoptionApplicationAdminResponse,
    AdoptionApplicationCreate, AdoptionReceipt, AdoptionStatusPatch,
    AdoptionStatusHistoryItem,
)

router = APIRouter(tags=["adoption-applications"])


def require_test_environment() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


admin_router = APIRouter(
    prefix="/admin/adoption-applications",
    tags=["adoption-applications-admin"],
    dependencies=[Depends(require_test_environment)],
)


@router.post("/adoption-applications", response_model=AdoptionReceipt, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_test_environment)])
def submit_adoption_application(
    payload: AdoptionApplicationCreate, db: Annotated[Session, Depends(get_db)]
) -> AdoptionReceipt:
    return controller.submit(db, payload)


@admin_router.get("", response_model=AdoptionApplicationAdminListResponse)
def read_admin_applications(
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    cat_id: Annotated[UUID | None, Query(alias="catId")] = None,
    application_status: Annotated[ApplicationStatus | None, Query(alias="status")] = None,
) -> AdoptionApplicationAdminListResponse:
    return controller.list_admin(
        db, limit=limit, offset=offset, cat_id=cat_id, application_status=application_status
    )


@admin_router.get("/{application_id}", response_model=AdoptionApplicationAdminResponse)
def read_admin_application(
    application_id: UUID, db: Annotated[Session, Depends(get_db)]
) -> AdoptionApplicationAdminResponse:
    return controller.get_admin(db, application_id)


@admin_router.patch("/{application_id}/status", response_model=AdoptionApplicationAdminResponse)
def patch_admin_application_status(
    application_id: UUID,
    payload: AdoptionStatusPatch,
    db: Annotated[Session, Depends(get_db)],
) -> AdoptionApplicationAdminResponse:
    return controller.update_status_with_notes(db, application_id, payload.status, payload.internal_notes)


@admin_router.get("/{application_id}/history", response_model=list[AdoptionStatusHistoryItem])
def read_application_history(application_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.status_history(db, application_id)


router.include_router(admin_router)
