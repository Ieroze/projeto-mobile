from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models.entities import Cat, CatHealthRecord, CatPhoto
from app.schemas.cat_admin_resources import (
    CatHealthRecordCreate, CatHealthRecordPatch, CatPhotoCreate, CatPhotoPatch,
)


def cat_exists(db: Session, cat_id: UUID) -> bool:
    return db.scalar(select(Cat.id).where(Cat.id == cat_id)) is not None


def list_photos(db: Session, cat_id: UUID, *, limit: int, offset: int):
    total = db.scalar(select(func.count(CatPhoto.id)).where(CatPhoto.cat_id == cat_id)) or 0
    rows = db.scalars(
        select(CatPhoto).where(CatPhoto.cat_id == cat_id)
        .order_by(CatPhoto.position, CatPhoto.created_at, CatPhoto.id).limit(limit).offset(offset)
    ).all()
    return list(rows), total


def get_photo(db: Session, cat_id: UUID, photo_id: UUID) -> CatPhoto | None:
    return db.scalar(select(CatPhoto).where(CatPhoto.id == photo_id, CatPhoto.cat_id == cat_id))


def create_photo(db: Session, cat_id: UUID, payload: CatPhotoCreate) -> CatPhoto:
    if payload.is_cover:
        db.execute(update(CatPhoto).where(CatPhoto.cat_id == cat_id).values(is_cover=False))
    photo = CatPhoto(cat_id=cat_id, **payload.model_dump())
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


def update_photo(db: Session, photo: CatPhoto, payload: CatPhotoPatch) -> CatPhoto:
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("is_cover") is True:
        db.execute(update(CatPhoto).where(CatPhoto.cat_id == photo.cat_id).values(is_cover=False))
    for field, value in updates.items():
        setattr(photo, field, value)
    db.commit()
    db.refresh(photo)
    return photo


def replace_photo(db: Session, photo: CatPhoto, payload: CatPhotoCreate) -> CatPhoto:
    if payload.is_cover:
        db.execute(update(CatPhoto).where(CatPhoto.cat_id == photo.cat_id).values(is_cover=False))
    for field, value in payload.model_dump().items():
        setattr(photo, field, value)
    db.commit()
    db.refresh(photo)
    return photo


def delete_photo(db: Session, photo: CatPhoto) -> None:
    db.delete(photo)
    db.commit()


def list_health_records(db: Session, cat_id: UUID, *, limit: int, offset: int):
    filters = [CatHealthRecord.cat_id == cat_id]
    total = db.scalar(select(func.count(CatHealthRecord.id)).where(*filters)) or 0
    rows = db.scalars(
        select(CatHealthRecord).where(*filters)
        .order_by(CatHealthRecord.occurred_on.desc().nullslast(), CatHealthRecord.created_at.desc(), CatHealthRecord.id)
        .limit(limit).offset(offset)
    ).all()
    return list(rows), total


def get_health_record(db: Session, cat_id: UUID, record_id: UUID) -> CatHealthRecord | None:
    return db.scalar(select(CatHealthRecord).where(CatHealthRecord.id == record_id, CatHealthRecord.cat_id == cat_id))


def create_health_record(db: Session, cat_id: UUID, payload: CatHealthRecordCreate) -> CatHealthRecord:
    record = CatHealthRecord(cat_id=cat_id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_health_record(db: Session, record: CatHealthRecord, payload: CatHealthRecordPatch) -> CatHealthRecord:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


def replace_health_record(db: Session, record: CatHealthRecord, payload: CatHealthRecordCreate) -> CatHealthRecord:
    for field, value in payload.model_dump().items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


def delete_health_record(db: Session, record: CatHealthRecord) -> None:
    db.delete(record)
    db.commit()
