from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import Campaign
from app.schemas.campaign import CampaignCreate, CampaignPatch


def list_campaigns(db: Session, *, limit: int, offset: int, published_only: bool = False):
    filters = [Campaign.published.is_(True)] if published_only else []
    total = db.scalar(select(func.count(Campaign.id)).where(*filters)) or 0
    statement = select(Campaign).where(*filters).order_by(Campaign.starts_on.desc().nullslast(), Campaign.created_at.desc(), Campaign.id).limit(limit).offset(offset)
    return list(db.scalars(statement).all()), total


def get_campaign(db: Session, campaign_id: UUID, *, published_only: bool = False) -> Campaign | None:
    filters = [Campaign.id == campaign_id]
    if published_only:
        filters.append(Campaign.published.is_(True))
    return db.scalar(select(Campaign).where(*filters))


def create_campaign(db: Session, payload: CampaignCreate) -> Campaign:
    campaign = Campaign(**payload.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


def update_campaign(db: Session, campaign: Campaign, payload: CampaignPatch) -> Campaign:
    updates = payload.model_dump(exclude_unset=True)
    start = updates.get("starts_on", campaign.starts_on)
    end = updates.get("ends_on", campaign.ends_on)
    if start and end and end < start:
        raise ValueError("endsOn must be on or after startsOn")
    for field, value in updates.items():
        setattr(campaign, field, value)
    db.commit()
    db.refresh(campaign)
    return campaign


def replace_campaign(db: Session, campaign: Campaign, payload: CampaignCreate) -> Campaign:
    for field, value in payload.model_dump().items():
        setattr(campaign, field, value)
    db.commit()
    db.refresh(campaign)
    return campaign


def delete_campaign(db: Session, campaign: Campaign) -> None:
    db.delete(campaign)
    db.commit()
