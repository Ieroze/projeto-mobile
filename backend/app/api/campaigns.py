from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.controllers import campaign_controller as controller
from app.core.config import settings
from app.db.database import get_db
from app.schemas.campaign import (
    CampaignAdminListResponse, CampaignAdminResponse, CampaignCreate, CampaignPatch,
    CampaignPublicListResponse, CampaignPublicResponse,
)

router = APIRouter(tags=["campaigns"])


def require_test_environment() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


admin_router = APIRouter(prefix="/admin/campaigns", tags=["campaigns-admin"], dependencies=[Depends(require_test_environment)])


@router.get("/campaigns", response_model=CampaignPublicListResponse)
def read_campaigns(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0):
    return controller.list_public(db, limit=limit, offset=offset)


@router.get("/campaigns/{campaign_id}", response_model=CampaignPublicResponse)
def read_campaign(campaign_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.get_public(db, campaign_id)


@admin_router.get("", response_model=CampaignAdminListResponse)
def read_admin_campaigns(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0):
    return controller.list_admin(db, limit=limit, offset=offset)


@admin_router.post("", response_model=CampaignAdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin_campaign(payload: CampaignCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.create_admin(db, payload)


@admin_router.get("/{campaign_id}", response_model=CampaignAdminResponse)
def read_admin_campaign(campaign_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.get_admin(db, campaign_id)


@admin_router.patch("/{campaign_id}", response_model=CampaignAdminResponse)
def patch_admin_campaign(campaign_id: UUID, payload: CampaignPatch, db: Annotated[Session, Depends(get_db)]):
    return controller.update_admin(db, campaign_id, payload)


@admin_router.put("/{campaign_id}", response_model=CampaignAdminResponse)
def replace_admin_campaign(campaign_id: UUID, payload: CampaignCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.replace_admin(db, campaign_id, payload)


@admin_router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin_campaign(campaign_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    controller.delete_admin(db, campaign_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


router.include_router(admin_router)
