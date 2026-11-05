from __future__ import annotations

from datetime import date, datetime
from typing import Any
from uuid import UUID
from sqlalchemy import ARRAY, BigInteger, Boolean, CheckConstraint, Date, DateTime, Enum as SAEnum, ForeignKey, Index, Integer, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import AdoptionStatus, ApplicationStatus, CareStatus

def enum_values(cls: type) -> list[str]:
    return [item.value for item in cls]

class UUIDPrimaryKey:
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))

class CreatedAt:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

class UpdatedTimestamps(CreatedAt):
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

class Admin(UUIDPrimaryKey, UpdatedTimestamps, Base):
    __tablename__ = "admins"
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

class Cat(UUIDPrimaryKey, UpdatedTimestamps, Base):
    __tablename__ = "cats"
    __table_args__ = (CheckConstraint("sex IN ('female', 'male')"), CheckConstraint("approximate_age_months >= 0"), Index("idx_cats_public_listing", "published", "adoption_status", "care_status"))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sex: Mapped[str] = mapped_column(String(10), nullable=False)
    birth_date: Mapped[date | None] = mapped_column(Date)
    approximate_age_months: Mapped[int | None] = mapped_column(Integer)
    short_description: Mapped[str | None] = mapped_column(String(280))
    description: Mapped[str | None] = mapped_column(Text)
    adoption_status: Mapped[AdoptionStatus] = mapped_column(SAEnum(AdoptionStatus, name="adoption_status", values_callable=enum_values), nullable=False, server_default=text("'not_available'"))
    care_status: Mapped[CareStatus] = mapped_column(SAEnum(CareStatus, name="care_status", values_callable=enum_values), nullable=False, server_default=text("'healthy'"))
    castrated: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    vaccinated: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    fiv_felv_negative: Mapped[bool | None] = mapped_column(Boolean)
    traits: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False, server_default=text("'{}'"))
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    photos: Mapped[list["CatPhoto"]] = relationship(back_populates="cat", order_by="CatPhoto.position")

    @property
    def cover_photo(self) -> CatPhoto | None:
        return next((photo for photo in self.photos if photo.is_cover), self.photos[0] if self.photos else None)

class CatPhoto(UUIDPrimaryKey, CreatedAt, Base):
    __tablename__ = "cat_photos"
    __table_args__ = (Index("idx_cat_photos_cat", "cat_id", "position"),)
    cat_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("cats.id", ondelete="CASCADE"), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(180))
    position: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    is_cover: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    cat: Mapped["Cat"] = relationship(back_populates="photos")

class CatHealthRecord(UUIDPrimaryKey, CreatedAt, Base):
    __tablename__ = "cat_health_records"
    cat_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("cats.id", ondelete="CASCADE"), nullable=False)
    record_type: Mapped[str] = mapped_column(String(60), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    occurred_on: Mapped[date | None] = mapped_column(Date)
    next_due_on: Mapped[date | None] = mapped_column(Date)

class AdoptionApplication(UUIDPrimaryKey, Base):
    __tablename__ = "adoption_applications"
    __table_args__ = (Index("idx_adoption_applications_cat_status", "cat_id", "status"),)
    protocol: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    cat_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("cats.id", ondelete="RESTRICT"), nullable=False)
    applicant_name: Mapped[str] = mapped_column(String(160), nullable=False)
    applicant_email: Mapped[str | None] = mapped_column(String(255))
    applicant_phone: Mapped[str] = mapped_column(String(40), nullable=False)
    city: Mapped[str | None] = mapped_column(String(120))
    answers: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    consent_privacy: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    status: Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus, name="application_status", values_callable=enum_values), nullable=False, server_default=text("'submitted'"))
    internal_notes: Mapped[str | None] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

class Campaign(UUIDPrimaryKey, UpdatedTimestamps, Base):
    __tablename__ = "campaigns"
    __table_args__ = (CheckConstraint("goal_cents >= 0"), CheckConstraint("raised_cents >= 0"), CheckConstraint("ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on"))
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    goal_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    raised_cents: Mapped[int] = mapped_column(BigInteger, nullable=False, server_default=text("0"))
    pix_key: Mapped[str | None] = mapped_column(String(255))
    starts_on: Mapped[date | None] = mapped_column(Date)
    ends_on: Mapped[date | None] = mapped_column(Date)
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))

class GuideCategory(UUIDPrimaryKey, Base):
    __tablename__ = "guide_categories"
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(140), nullable=False, unique=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

class GuideArticle(UUIDPrimaryKey, UpdatedTimestamps, Base):
    __tablename__ = "guide_articles"
    __table_args__ = (Index("idx_guide_articles_public", "published", "category_id", text("published_at DESC")),)
    category_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("guide_categories.id", ondelete="RESTRICT"), nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    summary: Mapped[str | None] = mapped_column(String(320))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    references_text: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("false"))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
