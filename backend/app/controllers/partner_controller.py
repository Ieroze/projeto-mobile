from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.entities import Partner
from app.models.enums import PartnerCategory
from app.schemas.partner import (
    PartnerAdminListResponse,
    PartnerAdminResponse,
    PartnerCreate,
    PartnerPatch,
    PartnerPublicListResponse,
    PartnerPublicResponse,
)
from app.services.partner_service import (
    create_partner,
    delete_partner,
    get_partner,
    list_partners,
    update_partner,
    replace_partner,
)


def list_public(db: Session, *, limit: int, offset: int, category: PartnerCategory | None) -> PartnerPublicListResponse:
    partners, total = list_partners(db, limit=limit, offset=offset, category=category, published_only=True)
    return PartnerPublicListResponse(
        items=[PartnerPublicResponse.model_validate(item) for item in partners], total=total, limit=limit, offset=offset
    )


def get_public(db: Session, partner_id: UUID) -> PartnerPublicResponse:
    partner = get_partner(db, partner_id, published_only=True)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return PartnerPublicResponse.model_validate(partner)


def list_admin(db: Session, *, limit: int, offset: int, category: PartnerCategory | None) -> PartnerAdminListResponse:
    partners, total = list_partners(db, limit=limit, offset=offset, category=category)
    return PartnerAdminListResponse(
        items=[PartnerAdminResponse.model_validate(item) for item in partners], total=total, limit=limit, offset=offset
    )


def get_admin(db: Session, partner_id: UUID) -> PartnerAdminResponse:
    partner = _require_partner(db, partner_id)
    return PartnerAdminResponse.model_validate(partner)


def create_admin(db: Session, payload: PartnerCreate) -> PartnerAdminResponse:
    return PartnerAdminResponse.model_validate(create_partner(db, payload))


def update_admin(db: Session, partner_id: UUID, payload: PartnerPatch) -> PartnerAdminResponse:
    partner = _require_partner(db, partner_id)
    return PartnerAdminResponse.model_validate(update_partner(db, partner, payload))


def replace_admin(db: Session, partner_id: UUID, payload: PartnerCreate) -> PartnerAdminResponse:
    partner = _require_partner(db, partner_id)
    return PartnerAdminResponse.model_validate(replace_partner(db, partner, payload))


def delete_admin(db: Session, partner_id: UUID) -> None:
    delete_partner(db, _require_partner(db, partner_id))


def _require_partner(db: Session, partner_id: UUID) -> Partner:
    partner = get_partner(db, partner_id)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return partner
