from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.controllers import guide_controller as controller
from app.core.config import settings
from app.db.database import get_db
from app.schemas.guide import (
    GuideArticleAdminListResponse, GuideArticleAdminResponse, GuideArticleCreate, GuideArticlePatch,
    GuideArticleListResponse, GuideArticleResponse, GuideCategoryCreate, GuideCategoryListResponse,
    GuideCategoryPatch, GuideCategoryResponse,
)

router = APIRouter(tags=["guide"])


def require_test_environment() -> None:
    if settings.app_env != "development":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


admin_categories_router = APIRouter(prefix="/admin/guide/categories", tags=["guide-categories-admin"], dependencies=[Depends(require_test_environment)])
admin_articles_router = APIRouter(prefix="/admin/guide/articles", tags=["guide-articles-admin"], dependencies=[Depends(require_test_environment)])


@router.get("/guide/categories", response_model=GuideCategoryListResponse)
def read_categories(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0):
    return controller.categories(db, limit=limit, offset=offset)


@router.get("/guide/articles", response_model=GuideArticleListResponse)
def read_articles(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0, category_id: Annotated[UUID | None, Query(alias="categoryId")] = None):
    return controller.articles(db, limit=limit, offset=offset, category_id=category_id)


@router.get("/guide/articles/{article_id}", response_model=GuideArticleResponse)
def read_article(article_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.article_public(db, article_id)


@admin_categories_router.get("", response_model=GuideCategoryListResponse)
def read_admin_categories(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0):
    return controller.admin_categories(db, limit=limit, offset=offset)


@admin_categories_router.post("", response_model=GuideCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_admin_category(payload: GuideCategoryCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.create_admin_category(db, payload)


@admin_categories_router.get("/{category_id}", response_model=GuideCategoryResponse)
def read_admin_category(category_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.category_admin(db, category_id)


@admin_categories_router.patch("/{category_id}", response_model=GuideCategoryResponse)
def patch_admin_category(category_id: UUID, payload: GuideCategoryPatch, db: Annotated[Session, Depends(get_db)]):
    return controller.update_admin_category(db, category_id, payload)


@admin_categories_router.put("/{category_id}", response_model=GuideCategoryResponse)
def replace_admin_category(category_id: UUID, payload: GuideCategoryCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.replace_admin_category(db, category_id, payload)


@admin_categories_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin_category(category_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    controller.delete_admin_category(db, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@admin_articles_router.get("", response_model=GuideArticleAdminListResponse)
def read_admin_articles(db: Annotated[Session, Depends(get_db)], limit: Annotated[int, Query(ge=1, le=100)] = 20, offset: Annotated[int, Query(ge=0)] = 0, category_id: Annotated[UUID | None, Query(alias="categoryId")] = None):
    return controller.admin_articles(db, limit=limit, offset=offset, category_id=category_id)


@admin_articles_router.post("", response_model=GuideArticleAdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin_article(payload: GuideArticleCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.create_admin_article(db, payload)


@admin_articles_router.get("/{article_id}", response_model=GuideArticleAdminResponse)
def read_admin_article(article_id: UUID, db: Annotated[Session, Depends(get_db)]):
    return controller.article_admin(db, article_id)


@admin_articles_router.patch("/{article_id}", response_model=GuideArticleAdminResponse)
def patch_admin_article(article_id: UUID, payload: GuideArticlePatch, db: Annotated[Session, Depends(get_db)]):
    return controller.update_admin_article(db, article_id, payload)


@admin_articles_router.put("/{article_id}", response_model=GuideArticleAdminResponse)
def replace_admin_article(article_id: UUID, payload: GuideArticleCreate, db: Annotated[Session, Depends(get_db)]):
    return controller.replace_admin_article(db, article_id, payload)


@admin_articles_router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin_article(article_id: UUID, db: Annotated[Session, Depends(get_db)]) -> Response:
    controller.delete_admin_article(db, article_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


router.include_router(admin_categories_router)
router.include_router(admin_articles_router)
