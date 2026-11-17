from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import MedicationStatus
from app.schemas.medication import MedicationRequestCreate, MedicationRequestAdminList, MedicationRequestAdminResponse, MedicationReceipt
from app.services import medication_service as service


def submit(db: Session, payload: MedicationRequestCreate) -> MedicationReceipt:
    return MedicationReceipt.model_validate(service.create_request(db, payload))


def list_admin(db: Session, limit: int, offset: int, request_status: MedicationStatus | None) -> MedicationRequestAdminList:
    rows, total = service.list_requests(db, limit, offset, request_status)
    return MedicationRequestAdminList(items=[MedicationRequestAdminResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def get_admin(db: Session, request_id) -> MedicationRequestAdminResponse:
    item = service.get_request(db, request_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Medication request not found")
    return MedicationRequestAdminResponse.model_validate(item)


def patch_status(db: Session, request_id, new_status: MedicationStatus, notes: str | None) -> MedicationRequestAdminResponse:
    item = service.get_request(db, request_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Medication request not found")
    try:
        item = service.update_status(db, item, new_status, notes)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return MedicationRequestAdminResponse.model_validate(item)
