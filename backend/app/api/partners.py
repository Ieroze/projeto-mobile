from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.controllers.partner_controller import (
    create_admin,
    delete_admin,
    get_admin,
    get_public,
    list_admin,
    list_public,
    update_admin,
    replace_admin,
)
from app.db.database import get_db
from app.core.config import settings
from app.models.enums import PartnerCategory
from app.schemas.partner import (
    PartnerAdminListResponse,
    PartnerAdminResponse,
    PartnerCreate,
    PartnerPatch,
    PartnerPublicListResponse,
    PartnerPublicResponse,
)

router = APIRouter(tags=["partners"])


def require_test_environment() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


admin_router = APIRouter(
    prefix="/admin",
    tags=["partners-admin"],
    dependencies=[Depends(require_test_environment)],
)


@router.get("/partners", response_model=PartnerPublicListResponse)
def read_partners(
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    category: Annotated[PartnerCategory | None, Query()] = None,
) -> PartnerPublicListResponse:
    return list_public(db, limit=limit, offset=offset, category=category)


@router.get("/partners/{partner_id}", response_model=PartnerPublicResponse)
def read_partner(partner_id: UUID, db: Annotated[Session, Depends(get_db)]) -> PartnerPublicResponse:
    return get_public(db, partner_id)


# Administrative routes are intentionally unauthenticated for local testing only.
@admin_router.get("/partners", response_model=PartnerAdminListResponse)
def read_admin_partners(
    db: Annotated[Session, Depends(get_db)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
    category: Annotated[PartnerCategory | None, Query()] = None,
) -> PartnerAdminListResponse:
    return list_admin(db, limit=limit, offset=offset, category=category)


@admin_router.post("/partners", response_model=PartnerAdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin_partner(payload: PartnerCreate, db: Annotated[Session, Depends(get_db)]) -> PartnerAdminResponse:
    return create_admin(db, payload)


@admin_router.get("/partners/{partner_id}", response_model=PartnerAdminResponse)
def read_admin_partner(partner_id: UUID, db: Annotated[Session, Depends(get_db)]) -> PartnerAdminResponse:
    return get_admin(db, partner_id)


@admin_router.patch("/partners/{partner_id}", response_model=PartnerAdminResponse)
def patch_admin_partner(
    partner_id: UUID,
    payload: PartnerPatch,
    db: Annotated[Session, Depends(get_db)],
) -> PartnerAdminResponse:
    return update_admin(db, partner_id, payload)


@admin_router.put("/partners/{partner_id}", response_model=PartnerAdminResponse)
def replace_admin_partner(
    partner_id: UUID,
    payload: PartnerCreate,
    db: Annotated[Session, Depends(get_db)],
) -> PartnerAdminResponse:
    return replace_admin(db, partner_id, payload)


@admin_router.delete("/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin_partner(partner_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    delete_admin(db, partner_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


router.include_router(admin_router)
