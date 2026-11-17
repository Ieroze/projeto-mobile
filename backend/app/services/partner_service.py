from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.entities import Partner, PartnerSocial
from app.models.enums import PartnerCategory
from app.schemas.partner import PartnerCreate, PartnerPatch


def list_partners(
    db: Session,
    *,
    limit: int,
    offset: int,
    category: PartnerCategory | None = None,
    published_only: bool = False,
) -> tuple[list[Partner], int]:
    filters = []
    if published_only:
        filters.append(Partner.published.is_(True))
    if category is not None:
        filters.append(Partner.category == category)
    total = db.scalar(select(func.count(Partner.id)).where(*filters)) or 0
    statement = (
        select(Partner)
        .options(selectinload(Partner.socials))
        .where(*filters)
        .order_by(Partner.position.asc(), Partner.name.asc(), Partner.id.asc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(statement).all()), total


def get_partner(db: Session, partner_id: UUID, *, published_only: bool = False) -> Partner | None:
    filters = [Partner.id == partner_id]
    if published_only:
        filters.append(Partner.published.is_(True))
    statement = select(Partner).options(selectinload(Partner.socials)).where(*filters)
    return db.scalar(statement)


def create_partner(db: Session, payload: PartnerCreate) -> Partner:
    partner = Partner(
        name=payload.name.strip(),
        category=payload.category,
        description=payload.description.strip(),
        position=payload.position,
        published=payload.published,
        socials=[
            PartnerSocial(platform=item.platform, label=item.label.strip(), url=item.url, position=position)
            for position, item in enumerate(payload.socials)
        ],
    )
    db.add(partner)
    db.commit()
    created = get_partner(db, partner.id)
    assert created is not None
    return created


def update_partner(db: Session, partner: Partner, payload: PartnerPatch) -> Partner:
    updates = payload.model_dump(exclude_unset=True)
    for field in ("name", "description"):
        if field in updates:
            updates[field] = updates[field].strip()
    socials = updates.pop("socials", None)
    for field, value in updates.items():
        setattr(partner, field, value)
    if socials is not None:
        partner.socials = [
            PartnerSocial(platform=item.platform, label=item.label.strip(), url=item.url, position=position)
            for position, item in enumerate(socials)
        ]
    db.commit()
    updated = get_partner(db, partner.id)
    assert updated is not None
    return updated


def replace_partner(db: Session, partner: Partner, payload: PartnerCreate) -> Partner:
    partner.name = payload.name.strip()
    partner.category = payload.category
    partner.description = payload.description.strip()
    partner.position = payload.position
    partner.published = payload.published
    partner.socials = [
        PartnerSocial(platform=item.platform, label=item.label.strip(), url=item.url, position=position)
        for position, item in enumerate(payload.socials)
    ]
    db.commit()
    updated = get_partner(db, partner.id)
    assert updated is not None
    return updated


def delete_partner(db: Session, partner: Partner) -> None:
    db.delete(partner)
    db.commit()
