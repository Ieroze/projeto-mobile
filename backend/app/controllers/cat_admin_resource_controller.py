from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.entities import CatHealthRecord, CatPhoto
from app.schemas.cat_admin_resources import (
    CatHealthRecordCreate, CatHealthRecordListResponse, CatHealthRecordPatch, CatHealthRecordResponse,
    CatPhotoCreate, CatPhotoListResponse, CatPhotoPatch, CatPhotoResponse,
)
from app.services.cat_admin_resource_service import (
    cat_exists, create_health_record, create_photo, delete_health_record, delete_photo,
    get_health_record, get_photo, list_health_records, list_photos, replace_health_record,
    replace_photo, update_health_record, update_photo,
)


def list_cat_photos(db: Session, cat_id: UUID, *, limit: int, offset: int) -> CatPhotoListResponse:
    _require_cat(db, cat_id)
    rows, total = list_photos(db, cat_id, limit=limit, offset=offset)
    return CatPhotoListResponse(items=[CatPhotoResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def create_cat_photo(db: Session, cat_id: UUID, payload: CatPhotoCreate) -> CatPhotoResponse:
    _require_cat(db, cat_id)
    return CatPhotoResponse.model_validate(create_photo(db, cat_id, payload))


def get_cat_photo(db: Session, cat_id: UUID, photo_id: UUID) -> CatPhotoResponse:
    return CatPhotoResponse.model_validate(_require_photo(db, cat_id, photo_id))


def patch_cat_photo(db: Session, cat_id: UUID, photo_id: UUID, payload: CatPhotoPatch) -> CatPhotoResponse:
    return CatPhotoResponse.model_validate(update_photo(db, _require_photo(db, cat_id, photo_id), payload))


def put_cat_photo(db: Session, cat_id: UUID, photo_id: UUID, payload: CatPhotoCreate) -> CatPhotoResponse:
    return CatPhotoResponse.model_validate(replace_photo(db, _require_photo(db, cat_id, photo_id), payload))


def remove_cat_photo(db: Session, cat_id: UUID, photo_id: UUID) -> None:
    delete_photo(db, _require_photo(db, cat_id, photo_id))


def list_cat_health_records(db: Session, cat_id: UUID, *, limit: int, offset: int) -> CatHealthRecordListResponse:
    _require_cat(db, cat_id)
    rows, total = list_health_records(db, cat_id, limit=limit, offset=offset)
    return CatHealthRecordListResponse(items=[CatHealthRecordResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def create_cat_health_record(db: Session, cat_id: UUID, payload: CatHealthRecordCreate) -> CatHealthRecordResponse:
    _require_cat(db, cat_id)
    return CatHealthRecordResponse.model_validate(create_health_record(db, cat_id, payload))


def get_cat_health_record(db: Session, cat_id: UUID, record_id: UUID) -> CatHealthRecordResponse:
    return CatHealthRecordResponse.model_validate(_require_health_record(db, cat_id, record_id))


def patch_cat_health_record(db: Session, cat_id: UUID, record_id: UUID, payload: CatHealthRecordPatch) -> CatHealthRecordResponse:
    return CatHealthRecordResponse.model_validate(update_health_record(db, _require_health_record(db, cat_id, record_id), payload))


def put_cat_health_record(db: Session, cat_id: UUID, record_id: UUID, payload: CatHealthRecordCreate) -> CatHealthRecordResponse:
    return CatHealthRecordResponse.model_validate(replace_health_record(db, _require_health_record(db, cat_id, record_id), payload))


def remove_cat_health_record(db: Session, cat_id: UUID, record_id: UUID) -> None:
    delete_health_record(db, _require_health_record(db, cat_id, record_id))


def _require_cat(db: Session, cat_id: UUID) -> None:
    if not cat_exists(db, cat_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found")


def _require_photo(db: Session, cat_id: UUID, photo_id: UUID) -> CatPhoto:
    _require_cat(db, cat_id)
    row = get_photo(db, cat_id, photo_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Cat photo not found")
    return row


def _require_health_record(db: Session, cat_id: UUID, record_id: UUID) -> CatHealthRecord:
    _require_cat(db, cat_id)
    row = get_health_record(db, cat_id, record_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Cat health record not found")
    return row
