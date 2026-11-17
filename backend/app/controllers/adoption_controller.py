from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.entities import AdoptionApplication
from app.models.enums import ApplicationStatus
from app.schemas.adoption import (
    AdoptionApplicationAdminListResponse, AdoptionApplicationAdminResponse,
    AdoptionApplicationCreate, AdoptionReceipt,
    AdoptionStatusHistoryItem,
)
from app.services.adoption_service import (
    create_application, get_application, list_applications, update_application_status,
)


def submit(db: Session, payload: AdoptionApplicationCreate) -> AdoptionReceipt:
    try:
        item = create_application(db, payload)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return AdoptionReceipt.model_validate(item)


def list_admin(
    db: Session, *, limit: int, offset: int, cat_id: UUID | None, application_status: ApplicationStatus | None
) -> AdoptionApplicationAdminListResponse:
    rows, total = list_applications(db, limit=limit, offset=offset, cat_id=cat_id, application_status=application_status)
    return AdoptionApplicationAdminListResponse(
        items=[AdoptionApplicationAdminResponse.model_validate(row) for row in rows],
        total=total, limit=limit, offset=offset,
    )


def get_admin(db: Session, application_id: UUID) -> AdoptionApplicationAdminResponse:
    return AdoptionApplicationAdminResponse.model_validate(_require_application(db, application_id))


def update_status(db: Session, application_id: UUID, new_status: ApplicationStatus) -> AdoptionApplicationAdminResponse:
    item = update_application_status(db, _require_application(db, application_id), new_status, None)
    return AdoptionApplicationAdminResponse.model_validate(item)


def update_status_with_notes(db: Session, application_id: UUID, new_status: ApplicationStatus, internal_notes: str | None) -> AdoptionApplicationAdminResponse:
    try:
        item = update_application_status(db, _require_application(db, application_id), new_status, internal_notes)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return AdoptionApplicationAdminResponse.model_validate(item)


def status_history(db: Session, application_id: UUID) -> list[AdoptionStatusHistoryItem]:
    _require_application(db, application_id)
    from app.services.adoption_service import list_status_history
    return [AdoptionStatusHistoryItem.model_validate(item) for item in list_status_history(db, application_id)]


def _require_application(db: Session, application_id: UUID) -> AdoptionApplication:
    item = get_application(db, application_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adoption application not found")
    return item
