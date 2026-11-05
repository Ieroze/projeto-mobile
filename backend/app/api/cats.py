from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.controllers.cat_controller import get_cat, list_cats
from app.db.database import get_db
from app.models.enums import AdoptionStatus, CareStatus
from app.schemas.cat import CatListResponse, CatPublicResponse

router = APIRouter(prefix="/cats", tags=["cats"])

@router.get("", response_model=CatListResponse)
def read_cats(
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    adoption_status: Annotated[AdoptionStatus | None, Query(alias="adoptionStatus")] = None,
    care_status: Annotated[CareStatus | None, Query(alias="careStatus")] = None,
) -> CatListResponse:
    return list_cats(db, limit=limit, offset=offset, adoption_status=adoption_status, care_status=care_status)

@router.get("/{cat_id}", response_model=CatPublicResponse)
def read_cat(cat_id: UUID, db: Annotated[Session, Depends(get_db)]) -> CatPublicResponse:
    return get_cat(db, cat_id)
