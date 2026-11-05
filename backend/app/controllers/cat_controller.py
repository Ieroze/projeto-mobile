from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.enums import AdoptionStatus, CareStatus
from app.schemas.cat import CatListResponse, CatPublicResponse
from app.services.cat_service import get_public_cat, list_public_cats

def list_cats(db: Session, *, limit: int, offset: int, adoption_status: AdoptionStatus | None, care_status: CareStatus | None) -> CatListResponse:
    cats, total = list_public_cats(db, limit=limit, offset=offset, adoption_status=adoption_status, care_status=care_status)
    return CatListResponse(items=[CatPublicResponse.model_validate(cat) for cat in cats], total=total, limit=limit, offset=offset)

def get_cat(db: Session, cat_id: UUID) -> CatPublicResponse:
    cat = get_public_cat(db, cat_id)
    if cat is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found")
    return CatPublicResponse.model_validate(cat)
