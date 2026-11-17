from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.controllers import cat_admin_resource_controller as controller
from app.core.config import settings
from app.db.database import get_db
from app.schemas.cat_admin_resources import (
    CatHealthRecordCreate, CatHealthRecordListResponse, CatHealthRecordPatch, CatHealthRecordResponse,
    CatPhotoCreate, CatPhotoListResponse, CatPhotoPatch, CatPhotoResponse,
)

router = APIRouter(tags=["cat-admin-resources"])


def require_test_environment() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


photo_router = APIRouter(
    prefix="/admin/cats/{cat_id}/photos", dependencies=[Depends(require_test_environment)]
)
health_router = APIRouter(
    prefix="/admin/cats/{cat_id}/health-records", dependencies=[Depends(require_test_environment)]
)


@photo_router.get("", response_model=CatPhotoListResponse)
def read_cat_photos(cat_id: UUID, db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0):
    return controller.list_cat_photos(db, cat_id, limit=limit, offset=offset)


@photo_router.post("", response_model=CatPhotoResponse, status_code=status.HTTP_201_CREATED)
def create_cat_photo(cat_id: UUID, payload: CatPhotoCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.create_cat_photo(db, cat_id, payload)


@photo_router.get("/{photo_id}", response_model=CatPhotoResponse)
def read_cat_photo(cat_id: UUID, photo_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.get_cat_photo(db, cat_id, photo_id)


@photo_router.patch("/{photo_id}", response_model=CatPhotoResponse)
def patch_cat_photo(cat_id: UUID, photo_id: UUID, payload: CatPhotoPatch, db: Annotated[Session, Depends(get_db)]):
    return controller.patch_cat_photo(db, cat_id, photo_id, payload)


@photo_router.put("/{photo_id}", response_model=CatPhotoResponse)
def replace_cat_photo(cat_id: UUID, photo_id: UUID, payload: CatPhotoCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.put_cat_photo(db, cat_id, photo_id, payload)


@photo_router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cat_photo(cat_id: UUID, photo_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    controller.remove_cat_photo(db, cat_id, photo_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@health_router.get("", response_model=CatHealthRecordListResponse)
def read_cat_health_records(cat_id: UUID, db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0):
    return controller.list_cat_health_records(db, cat_id, limit=limit, offset=offset)


@health_router.post("", response_model=CatHealthRecordResponse, status_code=status.HTTP_201_CREATED)
def create_cat_health_record(cat_id: UUID, payload: CatHealthRecordCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.create_cat_health_record(db, cat_id, payload)


@health_router.get("/{record_id}", response_model=CatHealthRecordResponse)
def read_cat_health_record(cat_id: UUID, record_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.get_cat_health_record(db, cat_id, record_id)


@health_router.patch("/{record_id}", response_model=CatHealthRecordResponse)
def patch_cat_health_record(cat_id: UUID, record_id: UUID, payload: CatHealthRecordPatch, db: Annotated[Session, Depends(get_db)]):
    return controller.patch_cat_health_record(db, cat_id, record_id, payload)


@health_router.put("/{record_id}", response_model=CatHealthRecordResponse)
def replace_cat_health_record(cat_id: UUID, record_id: UUID, payload: CatHealthRecordCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.put_cat_health_record(db, cat_id, record_id, payload)


@health_router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cat_health_record(cat_id: UUID, record_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    controller.remove_cat_health_record(db, cat_id, record_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


router.include_router(photo_router)
router.include_router(health_router)
