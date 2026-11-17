from datetime import date, datetime
from uuid import UUID
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class CatAdminResourceSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


class CatPhotoFields(CatAdminResourceSchema):
    url: str = Field(min_length=1, max_length=2048)
    alt_text: str | None = Field(default=None, max_length=180)
    position: int = Field(default=0, ge=0)
    is_cover: bool = False

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("url must be a string")
        cleaned = value.strip()
        parsed = urlparse(cleaned)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("url must be an absolute http or https URL")
        return cleaned


class CatPhotoCreate(CatPhotoFields):
    pass


class CatPhotoPatch(CatAdminResourceSchema):
    url: str | None = Field(default=None, min_length=1, max_length=2048)
    alt_text: str | None = Field(default=None, max_length=180)
    position: int | None = Field(default=None, ge=0)
    is_cover: bool | None = None

    @field_validator("url", mode="before")
    @classmethod
    def validate_optional_url(cls, value: object) -> str | None:
        if value is None:
            return None
        return CatPhotoFields.validate_url(value)

    @model_validator(mode="after")
    def validate_patch(self):
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        if any(getattr(self, key) is None for key in self.model_fields_set if key != "alt_text"):
            raise ValueError("patch field cannot be null")
        return self


class CatPhotoResponse(CatAdminResourceSchema):
    id: UUID
    cat_id: UUID
    url: str
    alt_text: str | None
    position: int
    is_cover: bool
    created_at: datetime


class CatPhotoListResponse(CatAdminResourceSchema):
    items: list[CatPhotoResponse]
    total: int
    limit: int
    offset: int


class CatHealthRecordFields(CatAdminResourceSchema):
    record_type: str = Field(min_length=1, max_length=60)
    title: str = Field(min_length=1, max_length=160)
    notes: str | None = None
    occurred_on: date | None = None
    next_due_on: date | None = None

    @field_validator("record_type", "title", mode="before")
    @classmethod
    def trim_required_text(cls, value: object) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must not be blank")
        return value.strip()

    @field_validator("notes", mode="before")
    @classmethod
    def trim_optional_notes(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("notes must be a string")
        return value.strip()


class CatHealthRecordCreate(CatHealthRecordFields):
    pass


class CatHealthRecordPatch(CatAdminResourceSchema):
    record_type: str | None = Field(default=None, min_length=1, max_length=60)
    title: str | None = Field(default=None, min_length=1, max_length=160)
    notes: str | None = None
    occurred_on: date | None = None
    next_due_on: date | None = None

    @field_validator("record_type", "title", mode="before")
    @classmethod
    def trim_optional_required_text(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must not be blank")
        return value.strip()

    @field_validator("notes", mode="before")
    @classmethod
    def trim_optional_notes(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("notes must be a string")
        return value.strip()

    @model_validator(mode="after")
    def validate_patch(self):
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        required = {"record_type", "title"}
        if any(getattr(self, key) is None for key in self.model_fields_set & required):
            raise ValueError("required patch fields cannot be null")
        return self


class CatHealthRecordResponse(CatAdminResourceSchema):
    id: UUID
    cat_id: UUID
    record_type: str
    title: str
    notes: str | None
    occurred_on: date | None
    next_due_on: date | None
    created_at: datetime


class CatHealthRecordListResponse(CatAdminResourceSchema):
    items: list[CatHealthRecordResponse]
    total: int
    limit: int
    offset: int
