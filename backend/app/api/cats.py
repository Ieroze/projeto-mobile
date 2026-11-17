from typing import Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.controllers.cat_controller import create_admin, delete_admin, get_admin, get_cat, list_admin, list_cats, replace_admin, update_admin
from app.db.database import get_db
from app.core.config import settings
from app.models.enums import AdoptionStatus, CareStatus
from app.schemas.cat import CatAdminCreate, CatAdminListResponse, CatAdminPatch, CatAdminResponse, CatListResponse, CatPublicResponse

router = APIRouter(prefix="/cats", tags=["cats"])

def require_test_environment() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

admin_router = APIRouter(
    prefix="/admin/cats",
    tags=["cats-admin"],
    dependencies=[Depends(require_test_environment)],
)

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

@admin_router.get("", response_model=CatAdminListResponse)
def read_admin_cats(
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> CatAdminListResponse:
    return list_admin(db, limit=limit, offset=offset)

@admin_router.post("", response_model=CatAdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin_cat(payload: CatAdminCreate, db: Annotated[Session, Depends(get_db)]) -> CatAdminResponse:
    return create_admin(db, payload)

@admin_router.get("/{cat_id}", response_model=CatAdminResponse)
def read_admin_cat(cat_id: UUID, db: Annotated[Session, Depends(get_db)]) -> CatAdminResponse:
    return get_admin(db, cat_id)

@admin_router.patch("/{cat_id}", response_model=CatAdminResponse)
def patch_admin_cat(
    cat_id: UUID,
    payload: CatAdminPatch,
    db: Annotated[Session, Depends(get_db)],
) -> CatAdminResponse:
    return update_admin(db, cat_id, payload)

@admin_router.put("/{cat_id}", response_model=CatAdminResponse)
def replace_admin_cat(
    cat_id: UUID,
    payload: CatAdminCreate,
    db: Annotated[Session, Depends(get_db)],
) -> CatAdminResponse:
    return replace_admin(db, cat_id, payload)

@admin_router.delete("/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin_cat(cat_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    delete_admin(db, cat_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
