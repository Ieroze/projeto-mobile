from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.entities import Cat
from app.models.enums import AdoptionStatus, CareStatus
from app.schemas.cat import CatAdminCreate, CatAdminListResponse, CatAdminPatch, CatAdminResponse, CatListResponse, CatPublicResponse
from app.services.cat_service import (
    create_admin_cat,
    delete_admin_cat,
    get_admin_cat,
    get_public_cat,
    list_admin_cats,
    list_public_cats,
    update_admin_cat,
    replace_admin_cat,
)

def list_cats(db: Session, *, limit: int, offset: int, adoption_status: AdoptionStatus | None, care_status: CareStatus | None) -> CatListResponse:
    cats, total = list_public_cats(db, limit=limit, offset=offset, adoption_status=adoption_status, care_status=care_status)
    return CatListResponse(items=[CatPublicResponse.model_validate(cat) for cat in cats], total=total, limit=limit, offset=offset)

def get_cat(db: Session, cat_id: UUID) -> CatPublicResponse:
    cat = get_public_cat(db, cat_id)
    if cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found")
    return CatPublicResponse.model_validate(cat)

def list_admin(db: Session, *, limit: int, offset: int) -> CatAdminListResponse:
    cats, total = list_admin_cats(db, limit=limit, offset=offset)
    return CatAdminListResponse(items=[CatAdminResponse.model_validate(cat) for cat in cats], total=total, limit=limit, offset=offset)

def get_admin(db: Session, cat_id: UUID) -> CatAdminResponse:
    cat = _require_admin_cat(db, cat_id)
    return CatAdminResponse.model_validate(cat)

def create_admin(db: Session, payload: CatAdminCreate) -> CatAdminResponse:
    return CatAdminResponse.model_validate(create_admin_cat(db, payload))

def update_admin(db: Session, cat_id: UUID, payload: CatAdminPatch) -> CatAdminResponse:
    cat = _require_admin_cat(db, cat_id)
    return CatAdminResponse.model_validate(update_admin_cat(db, cat, payload))

def replace_admin(db: Session, cat_id: UUID, payload: CatAdminCreate) -> CatAdminResponse:
    cat = _require_admin_cat(db, cat_id)
    return CatAdminResponse.model_validate(replace_admin_cat(db, cat, payload))

def delete_admin(db: Session, cat_id: UUID) -> None:
    delete_admin_cat(db, _require_admin_cat(db, cat_id))

def _require_admin_cat(db: Session, cat_id: UUID) -> Cat:
    cat = get_admin_cat(db, cat_id)
    if cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found")
    return cat
