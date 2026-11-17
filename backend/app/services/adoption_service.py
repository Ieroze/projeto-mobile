import secrets
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import AdoptionApplication, AdoptionApplicationStatusHistory, Cat
from app.models.enums import AdoptionStatus, ApplicationStatus
from app.schemas.adoption import AdoptionApplicationCreate


def create_application(db: Session, payload: AdoptionApplicationCreate) -> AdoptionApplication:
    # Lock the cat row while checking availability to avoid accepting simultaneous requests
    # after the cat has already moved out of the available state.
    cat = db.scalar(select(Cat).where(Cat.id == payload.cat_id, Cat.published.is_(True)).with_for_update())
    if cat is None:
        raise LookupError("Cat not found")
    if cat.adoption_status != AdoptionStatus.AVAILABLE:
        raise ValueError("Cat is not available for adoption")

    answers = {
        key: value
        for key, value in {
            "housingType": payload.housing_type,
            "hasOtherAnimals": payload.has_other_animals,
            "adoptionReasons": payload.adoption_reasons,
        }.items()
        if value is not None
    }
    for _ in range(3):
        protocol = f"ADC-{secrets.token_urlsafe(18)}"
        if db.scalar(select(AdoptionApplication.id).where(AdoptionApplication.protocol == protocol)) is None:
            break
    else:
        raise RuntimeError("Could not generate a unique application protocol")

    application = AdoptionApplication(
        protocol=protocol,
        cat_id=payload.cat_id,
        applicant_name=payload.applicant_name,
        applicant_email=str(payload.applicant_email) if payload.applicant_email else None,
        applicant_phone=payload.applicant_phone,
        city=payload.city,
        answers=answers,
        consent_privacy=True,
        status=ApplicationStatus.SUBMITTED,
    )
    db.add(application)
    db.flush()
    db.add(AdoptionApplicationStatusHistory(
        application_id=application.id, previous_status=None,
        new_status=ApplicationStatus.SUBMITTED, note="Application submitted",
    ))
    db.commit()
    db.refresh(application)
    return application


def list_applications(
    db: Session,
    *,
    limit: int,
    offset: int,
    cat_id: UUID | None = None,
    application_status: ApplicationStatus | None = None,
) -> tuple[list[AdoptionApplication], int]:
    filters = []
    if cat_id is not None:
        filters.append(AdoptionApplication.cat_id == cat_id)
    if application_status is not None:
        filters.append(AdoptionApplication.status == application_status)
    total = db.scalar(select(func.count(AdoptionApplication.id)).where(*filters)) or 0
    rows = db.scalars(
        select(AdoptionApplication).where(*filters)
        .order_by(AdoptionApplication.submitted_at.desc(), AdoptionApplication.id)
        .limit(limit).offset(offset)
    ).all()
    return list(rows), total


def get_application(db: Session, application_id: UUID) -> AdoptionApplication | None:
    return db.get(AdoptionApplication, application_id)


ALLOWED_TRANSITIONS = {
    ApplicationStatus.SUBMITTED: {ApplicationStatus.UNDER_REVIEW, ApplicationStatus.CANCELLED},
    ApplicationStatus.UNDER_REVIEW: {ApplicationStatus.NEEDS_INFORMATION, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.CANCELLED},
    ApplicationStatus.NEEDS_INFORMATION: {ApplicationStatus.UNDER_REVIEW, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.CANCELLED},
    ApplicationStatus.APPROVED: {ApplicationStatus.COMPLETED, ApplicationStatus.CANCELLED},
    ApplicationStatus.REJECTED: set(), ApplicationStatus.COMPLETED: set(), ApplicationStatus.CANCELLED: set(),
}


def update_application_status(
    db: Session, application: AdoptionApplication, new_status: ApplicationStatus,
    internal_notes: str | None,
) -> AdoptionApplication:
    application = db.scalar(select(AdoptionApplication).where(AdoptionApplication.id == application.id).with_for_update())
    if application is None:
        raise LookupError("Adoption application not found")
    previous = application.status
    if new_status != previous and new_status not in ALLOWED_TRANSITIONS[previous]:
        raise ValueError(f"Cannot transition adoption application from {previous.value} to {new_status.value}")
    if internal_notes is not None:
        application.internal_notes = internal_notes
    if new_status == previous:
        db.commit()
        db.refresh(application)
        return application
    application.status = new_status
    application.updated_at = datetime.now(timezone.utc)
    db.add(AdoptionApplicationStatusHistory(
        application_id=application.id, previous_status=previous, new_status=new_status,
        note=internal_notes,
    ))
    db.commit()
    db.refresh(application)
    return application


def list_status_history(db: Session, application_id: UUID) -> list[AdoptionApplicationStatusHistory]:
    return list(db.scalars(select(AdoptionApplicationStatusHistory).where(
        AdoptionApplicationStatusHistory.application_id == application_id
    ).order_by(AdoptionApplicationStatusHistory.changed_at, AdoptionApplicationStatusHistory.id)).all())
