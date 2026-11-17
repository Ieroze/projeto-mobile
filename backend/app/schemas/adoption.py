import re
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import ApplicationStatus


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class AdoptionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


class AdoptionApplicationCreate(AdoptionSchema):
    cat_id: UUID
    applicant_name: str = Field(min_length=2, max_length=160)
    applicant_phone: str = Field(min_length=10, max_length=20)
    applicant_email: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=120)
    housing_type: Literal["house", "apartment", "other"] | None = None
    has_other_animals: bool | None = None
    adoption_reasons: str | None = Field(default=None, max_length=500)
    consent_privacy: Literal[True]

    @field_validator("applicant_name", "city", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must not be blank")
        return value.strip()

    @field_validator("applicant_phone", mode="before")
    @classmethod
    def normalize_phone(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        digits = re.sub(r"\D", "", value)
        if len(digits) not in (10, 11):
            raise ValueError("must contain a Brazilian area code and 10 or 11 digits")
        return digits

    @field_validator("adoption_reasons", mode="before")
    @classmethod
    def trim_reasons(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be a string")
        return value.strip()

    @field_validator("applicant_email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("must be a valid email address")
        return value


class AdoptionReceipt(AdoptionSchema):
    protocol: str
    cat_id: UUID
    submitted_at: datetime


class AdoptionStatusPatch(AdoptionSchema):
    status: ApplicationStatus
    internal_notes: str | None = Field(default=None, max_length=4000)


class AdoptionApplicationAdminResponse(AdoptionSchema):
    id: UUID
    protocol: str
    cat_id: UUID
    applicant_name: str
    applicant_email: str | None
    applicant_phone: str
    city: str | None
    answers: dict[str, object]
    consent_privacy: bool
    status: ApplicationStatus
    internal_notes: str | None
    submitted_at: datetime
    updated_at: datetime


class AdoptionApplicationAdminListResponse(AdoptionSchema):
    items: list[AdoptionApplicationAdminResponse]
    total: int
    limit: int
    offset: int


class AdoptionStatusHistoryItem(AdoptionSchema):
    id: UUID
    application_id: UUID
    previous_status: ApplicationStatus | None
    new_status: ApplicationStatus
    note: str | None
    changed_at: datetime
