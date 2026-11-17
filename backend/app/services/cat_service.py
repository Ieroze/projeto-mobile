from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload
from app.models.entities import Cat
from app.models.enums import AdoptionStatus, CareStatus
from app.schemas.cat import CatAdminCreate, CatAdminPatch

def list_public_cats(db: Session, *, limit: int, offset: int, adoption_status: AdoptionStatus | None = None, care_status: CareStatus | None = None) -> tuple[list[Cat], int]:
    filters = [Cat.published.is_(True)]
    if adoption_status is not None:
        filters.append(Cat.adoption_status == adoption_status)
    if care_status is not None:
        filters.append(Cat.care_status == care_status)
    total = db.scalar(select(func.count(Cat.id)).where(*filters)) or 0
    statement = (
        select(Cat).options(selectinload(Cat.photos)).where(*filters)
        .order_by(Cat.name.asc(), Cat.id.asc()).limit(limit).offset(offset)
    )
    return list(db.scalars(statement).all()), total

def get_public_cat(db: Session, cat_id: UUID) -> Cat | None:
    statement = select(Cat).options(selectinload(Cat.photos)).where(
        Cat.id == cat_id, Cat.published.is_(True)
    )
    return db.scalar(statement)

def list_admin_cats(db: Session, *, limit: int, offset: int) -> tuple[list[Cat], int]:
    total = db.scalar(select(func.count(Cat.id))) or 0
    statement = (
        select(Cat).options(selectinload(Cat.photos))
        .order_by(Cat.name.asc(), Cat.id.asc()).limit(limit).offset(offset)
    )
    return list(db.scalars(statement).all()), total

def get_admin_cat(db: Session, cat_id: UUID) -> Cat | None:
    statement = select(Cat).options(selectinload(Cat.photos)).where(Cat.id == cat_id)
    return db.scalar(statement)

def create_admin_cat(db: Session, payload: CatAdminCreate) -> Cat:
    cat = Cat(**payload.model_dump())
    db.add(cat)
    db.commit()
    saved = get_admin_cat(db, cat.id)
    assert saved is not None
    return saved

def update_admin_cat(db: Session, cat: Cat, payload: CatAdminPatch) -> Cat:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    saved = get_admin_cat(db, cat.id)
    assert saved is not None
    return saved

def replace_admin_cat(db: Session, cat: Cat, payload: CatAdminCreate) -> Cat:
    for field, value in payload.model_dump().items():
        setattr(cat, field, value)
    db.commit()
    saved = get_admin_cat(db, cat.id)
    assert saved is not None
    return saved

def delete_admin_cat(db: Session, cat: Cat) -> None:
    db.delete(cat)
    db.commit()
