import secrets
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import MedicationRequest
from app.models.enums import MedicationStatus
from app.schemas.medication import MedicationRequestCreate


TRANSITIONS = {
    MedicationStatus.SUBMITTED: {MedicationStatus.UNDER_REVIEW, MedicationStatus.CANCELLED},
    MedicationStatus.UNDER_REVIEW: {MedicationStatus.NEEDS_INFORMATION, MedicationStatus.APPROVED, MedicationStatus.REJECTED, MedicationStatus.CANCELLED},
    MedicationStatus.NEEDS_INFORMATION: {MedicationStatus.UNDER_REVIEW, MedicationStatus.APPROVED, MedicationStatus.REJECTED, MedicationStatus.CANCELLED},
    MedicationStatus.APPROVED: {MedicationStatus.COMPLETED, MedicationStatus.CANCELLED},
    MedicationStatus.REJECTED: set(), MedicationStatus.COMPLETED: set(), MedicationStatus.CANCELLED: set(),
}


def create_request(db: Session, payload: MedicationRequestCreate) -> MedicationRequest:
    protocol = f"MED-{secrets.token_urlsafe(18)}"
    item = MedicationRequest(protocol=protocol, **payload.model_dump(exclude={"consent_privacy"}), consent_privacy=True)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_requests(db: Session, limit: int, offset: int, request_status: MedicationStatus | None):
    filters = [MedicationRequest.status == request_status] if request_status else []
    total = db.scalar(select(func.count(MedicationRequest.id)).where(*filters)) or 0
    rows = db.scalars(select(MedicationRequest).where(*filters).order_by(MedicationRequest.submitted_at.desc()).limit(limit).offset(offset)).all()
    return list(rows), total


def get_request(db: Session, request_id):
    return db.get(MedicationRequest, request_id)


def update_status(db: Session, item: MedicationRequest, new_status: MedicationStatus, notes: str | None):
    item = db.scalar(select(MedicationRequest).where(MedicationRequest.id == item.id).with_for_update())
    if item is None:
        raise LookupError("Medication request not found")
    if item.status != new_status and new_status not in TRANSITIONS[item.status]:
        raise ValueError(f"Cannot transition medication request from {item.status.value} to {new_status.value}")
    if notes is not None:
        item.internal_notes = notes
    if item.status != new_status:
        item.status = new_status
        item.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item
