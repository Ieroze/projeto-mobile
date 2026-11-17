from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.entities import Campaign
from app.schemas.campaign import (
    CampaignAdminListResponse, CampaignAdminResponse, CampaignCreate, CampaignPatch,
    CampaignPublicListResponse, CampaignPublicResponse,
)
from app.services.campaign_service import (
    create_campaign, delete_campaign, get_campaign, list_campaigns, replace_campaign, update_campaign,
)


def list_public(db: Session, *, limit: int, offset: int) -> CampaignPublicListResponse:
    items, total = list_campaigns(db, limit=limit, offset=offset, published_only=True)
    return CampaignPublicListResponse(items=[CampaignPublicResponse.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


def get_public(db: Session, campaign_id: UUID) -> CampaignPublicResponse:
    item = get_campaign(db, campaign_id, published_only=True)
    if item is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return CampaignPublicResponse.model_validate(item)


def list_admin(db: Session, *, limit: int, offset: int) -> CampaignAdminListResponse:
    items, total = list_campaigns(db, limit=limit, offset=offset)
    return CampaignAdminListResponse(items=[CampaignAdminResponse.model_validate(i) for i in items], total=total, limit=limit, offset=offset)


def get_admin(db: Session, campaign_id: UUID) -> CampaignAdminResponse:
    return CampaignAdminResponse.model_validate(_require_campaign(db, campaign_id))


def create_admin(db: Session, payload: CampaignCreate) -> CampaignAdminResponse:
    return CampaignAdminResponse.model_validate(create_campaign(db, payload))


def update_admin(db: Session, campaign_id: UUID, payload: CampaignPatch) -> CampaignAdminResponse:
    try:
        item = update_campaign(db, _require_campaign(db, campaign_id), payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return CampaignAdminResponse.model_validate(item)


def replace_admin(db: Session, campaign_id: UUID, payload: CampaignCreate) -> CampaignAdminResponse:
    return CampaignAdminResponse.model_validate(replace_campaign(db, _require_campaign(db, campaign_id), payload))


def delete_admin(db: Session, campaign_id: UUID) -> None:
    delete_campaign(db, _require_campaign(db, campaign_id))


def _require_campaign(db: Session, campaign_id: UUID) -> Campaign:
    item = get_campaign(db, campaign_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    return item
