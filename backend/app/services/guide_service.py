from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import GuideArticle, GuideCategory
from app.schemas.guide import GuideArticleCreate, GuideArticlePatch, GuideCategoryCreate, GuideCategoryPatch


def list_categories(db: Session, *, limit: int, offset: int, public: bool = False):
    filters = [GuideCategory.published.is_(True)] if public else []
    total = db.scalar(select(func.count(GuideCategory.id)).where(*filters)) or 0
    rows = db.scalars(select(GuideCategory).where(*filters).order_by(GuideCategory.position, GuideCategory.name, GuideCategory.id).limit(limit).offset(offset)).all()
    return list(rows), total


def get_category(db: Session, category_id: UUID, *, public: bool = False) -> GuideCategory | None:
    filters = [GuideCategory.id == category_id]
    if public:
        filters.append(GuideCategory.published.is_(True))
    return db.scalar(select(GuideCategory).where(*filters))


def create_category(db: Session, payload: GuideCategoryCreate) -> GuideCategory:
    row = GuideCategory(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_category(db: Session, row: GuideCategory, payload: GuideCategoryPatch) -> GuideCategory:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def replace_category(db: Session, row: GuideCategory, payload: GuideCategoryCreate) -> GuideCategory:
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_category(db: Session, row: GuideCategory) -> bool:
    has_articles = db.scalar(select(GuideArticle.id).where(GuideArticle.category_id == row.id).limit(1)) is not None
    if has_articles:
        return False
    db.delete(row)
    db.commit()
    return True


def list_articles(db: Session, *, limit: int, offset: int, category_id: UUID | None = None, public: bool = False):
    filters = []
    if public:
        filters.extend([GuideArticle.published.is_(True), GuideCategory.published.is_(True)])
    if category_id is not None:
        filters.append(GuideArticle.category_id == category_id)
    query = select(GuideArticle).join(GuideCategory, GuideArticle.category_id == GuideCategory.id).where(*filters)
    total = db.scalar(select(func.count(GuideArticle.id)).join(GuideCategory, GuideArticle.category_id == GuideCategory.id).where(*filters)) or 0
    rows = db.scalars(query.order_by(GuideArticle.published_at.desc().nullslast(), GuideArticle.title, GuideArticle.id).limit(limit).offset(offset)).all()
    return list(rows), total


def get_article(db: Session, article_id: UUID, *, public: bool = False) -> GuideArticle | None:
    filters = [GuideArticle.id == article_id]
    if public:
        filters.extend([GuideArticle.published.is_(True), GuideCategory.published.is_(True)])
    query = select(GuideArticle).join(GuideCategory, GuideArticle.category_id == GuideCategory.id).where(*filters)
    return db.scalar(query)


def create_article(db: Session, payload: GuideArticleCreate) -> GuideArticle:
    row = GuideArticle(**payload.model_dump())
    if row.published:
        row.published_at = datetime.now(timezone.utc)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_article(db: Session, row: GuideArticle, payload: GuideArticlePatch) -> GuideArticle:
    updates = payload.model_dump(exclude_unset=True)
    if updates.get("published") is True and not row.published:
        row.published_at = datetime.now(timezone.utc)
    for key, value in updates.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def replace_article(db: Session, row: GuideArticle, payload: GuideArticleCreate) -> GuideArticle:
    values = payload.model_dump()
    if values["published"] and not row.published:
        row.published_at = datetime.now(timezone.utc)
    for key, value in values.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


def delete_article(db: Session, row: GuideArticle) -> None:
    db.delete(row)
    db.commit()
