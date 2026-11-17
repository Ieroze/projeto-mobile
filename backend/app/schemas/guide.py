from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


def clean_text(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("must be a string")
    value = value.strip()
    if not value:
        raise ValueError("must not be blank")
    return value


class GuideSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


class GuideCategoryFields(GuideSchema):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(min_length=1, max_length=140, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    position: int = Field(default=0, ge=0)
    published: bool = True

    @field_validator("name", "slug", mode="before")
    @classmethod
    def trim_required(cls, value: object) -> str:
        return clean_text(value)


class GuideCategoryCreate(GuideCategoryFields):
    pass


class GuideCategoryPatch(GuideSchema):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: str | None = Field(default=None, min_length=1, max_length=140, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    position: int | None = Field(default=None, ge=0)
    published: bool | None = None

    @field_validator("name", "slug", mode="before")
    @classmethod
    def trim_optional(cls, value: object) -> str | None:
        return clean_text(value) if value is not None else None

    @model_validator(mode="after")
    def validate_patch(self):
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        if any(getattr(self, key) is None for key in self.model_fields_set):
            raise ValueError("patch fields cannot be null")
        return self


class GuideCategoryResponse(GuideSchema):
    id: UUID
    name: str
    slug: str
    position: int
    published: bool


class GuideCategoryListResponse(GuideSchema):
    items: list[GuideCategoryResponse]
    total: int
    limit: int
    offset: int


class GuideArticleFields(GuideSchema):
    category_id: UUID
    title: str = Field(min_length=1, max_length=180)
    slug: str = Field(min_length=1, max_length=200, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str | None = Field(default=None, max_length=320)
    body: str = Field(min_length=1)
    references_text: str | None = None
    published: bool = False

    @field_validator("title", "slug", "body", mode="before")
    @classmethod
    def trim_required(cls, value: object) -> str:
        return clean_text(value)

    @field_validator("summary", "references_text", mode="before")
    @classmethod
    def trim_optional_text(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be a string")
        return value.strip()


class GuideArticleCreate(GuideArticleFields):
    pass


class GuideArticlePatch(GuideSchema):
    category_id: UUID | None = None
    title: str | None = Field(default=None, min_length=1, max_length=180)
    slug: str | None = Field(default=None, min_length=1, max_length=200, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str | None = Field(default=None, max_length=320)
    body: str | None = Field(default=None, min_length=1)
    references_text: str | None = None
    published: bool | None = None

    @field_validator("title", "slug", "body", mode="before")
    @classmethod
    def trim_required(cls, value: object) -> str | None:
        return clean_text(value) if value is not None else None

    @field_validator("summary", "references_text", mode="before")
    @classmethod
    def trim_optional_text(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be a string")
        return value.strip()

    @model_validator(mode="after")
    def validate_patch(self):
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        required = {"category_id", "title", "slug", "body", "published"}
        if any(getattr(self, key) is None for key in self.model_fields_set & required):
            raise ValueError("required patch fields cannot be null")
        return self


class GuideArticleResponse(GuideSchema):
    id: UUID
    category_id: UUID
    title: str
    slug: str
    summary: str | None
    body: str
    references_text: str | None
    published: bool
    published_at: datetime | None


class GuideArticleAdminResponse(GuideArticleResponse):
    created_at: datetime
    updated_at: datetime


class GuideArticleListResponse(GuideSchema):
    items: list[GuideArticleResponse]
    total: int
    limit: int
    offset: int


class GuideArticleAdminListResponse(GuideSchema):
    items: list[GuideArticleAdminResponse]
    total: int
    limit: int
    offset: int
