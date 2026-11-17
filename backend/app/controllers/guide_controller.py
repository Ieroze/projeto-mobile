from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.entities import GuideArticle, GuideCategory
from app.schemas.guide import (
    GuideArticleAdminListResponse, GuideArticleAdminResponse, GuideArticleCreate, GuideArticlePatch,
    GuideArticleListResponse, GuideArticleResponse, GuideCategoryCreate, GuideCategoryListResponse,
    GuideCategoryPatch, GuideCategoryResponse,
)
from app.services.guide_service import (
    create_article, create_category, delete_article, delete_category, get_article, get_category,
    list_articles, list_categories, replace_article, replace_category, update_article, update_category,
)


def categories(db: Session, *, limit: int, offset: int) -> GuideCategoryListResponse:
    rows, total = list_categories(db, limit=limit, offset=offset, public=True)
    return GuideCategoryListResponse(items=[GuideCategoryResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def admin_categories(db: Session, *, limit: int, offset: int) -> GuideCategoryListResponse:
    rows, total = list_categories(db, limit=limit, offset=offset)
    return GuideCategoryListResponse(items=[GuideCategoryResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def category_admin(db: Session, category_id: UUID) -> GuideCategoryResponse:
    return GuideCategoryResponse.model_validate(_require_category(db, category_id))


def create_admin_category(db: Session, payload: GuideCategoryCreate) -> GuideCategoryResponse:
    return GuideCategoryResponse.model_validate(create_category(db, payload))


def update_admin_category(db: Session, category_id: UUID, payload: GuideCategoryPatch) -> GuideCategoryResponse:
    return GuideCategoryResponse.model_validate(update_category(db, _require_category(db, category_id), payload))


def replace_admin_category(db: Session, category_id: UUID, payload: GuideCategoryCreate) -> GuideCategoryResponse:
    return GuideCategoryResponse.model_validate(replace_category(db, _require_category(db, category_id), payload))


def delete_admin_category(db: Session, category_id: UUID) -> None:
    if not delete_category(db, _require_category(db, category_id)):
        raise HTTPException(status_code=409, detail="Category has articles and cannot be deleted")


def articles(db: Session, *, limit: int, offset: int, category_id: UUID | None) -> GuideArticleListResponse:
    rows, total = list_articles(db, limit=limit, offset=offset, category_id=category_id, public=True)
    return GuideArticleListResponse(items=[GuideArticleResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def article_public(db: Session, article_id: UUID) -> GuideArticleResponse:
    row = get_article(db, article_id, public=True)
    if row is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return GuideArticleResponse.model_validate(row)


def admin_articles(db: Session, *, limit: int, offset: int, category_id: UUID | None) -> GuideArticleAdminListResponse:
    rows, total = list_articles(db, limit=limit, offset=offset, category_id=category_id)
    return GuideArticleAdminListResponse(items=[GuideArticleAdminResponse.model_validate(row) for row in rows], total=total, limit=limit, offset=offset)


def article_admin(db: Session, article_id: UUID) -> GuideArticleAdminResponse:
    return GuideArticleAdminResponse.model_validate(_require_article(db, article_id))


def create_admin_article(db: Session, payload: GuideArticleCreate) -> GuideArticleAdminResponse:
    _require_category(db, payload.category_id)
    return GuideArticleAdminResponse.model_validate(create_article(db, payload))


def update_admin_article(db: Session, article_id: UUID, payload: GuideArticlePatch) -> GuideArticleAdminResponse:
    row = _require_article(db, article_id)
    if payload.category_id is not None:
        _require_category(db, payload.category_id)
    return GuideArticleAdminResponse.model_validate(update_article(db, row, payload))


def replace_admin_article(db: Session, article_id: UUID, payload: GuideArticleCreate) -> GuideArticleAdminResponse:
    _require_category(db, payload.category_id)
    return GuideArticleAdminResponse.model_validate(replace_article(db, _require_article(db, article_id), payload))


def delete_admin_article(db: Session, article_id: UUID) -> None:
    delete_article(db, _require_article(db, article_id))


def _require_category(db: Session, category_id: UUID) -> GuideCategory:
    row = get_category(db, category_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return row


def _require_article(db: Session, article_id: UUID) -> GuideArticle:
    row = get_article(db, article_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return row
