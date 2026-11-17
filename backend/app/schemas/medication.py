import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.enums import MedicationStatus, MedicationUrgency


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class MedicationSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True, extra="forbid")


class MedicationRequestCreate(MedicationSchema):
    person_name: str | None = Field(default=None, min_length=2, max_length=160)
    person_email: str | None = Field(default=None, max_length=255)
    person_phone_whatsapp: str | None = Field(default=None, max_length=40)
    cat_name: str | None = Field(default=None, min_length=2, max_length=120)
    cat_age: str | None = Field(default=None, max_length=80)
    request_reason: str | None = Field(default=None, max_length=500)
    diagnosis: str | None = Field(default=None, max_length=500)
    dosage: str | None = Field(default=None, max_length=160)
    urgency: MedicationUrgency | None = None
    pickup_availability: str | None = Field(default=None, max_length=160)
    consent_privacy: bool

    @field_validator("person_name", "cat_name", "cat_age", "request_reason", "diagnosis", "dosage", "pickup_availability", mode="before")
    @classmethod
    def clean_text(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be a string")
        cleaned = " ".join(value.split())
        return cleaned or None

    @field_validator("person_email")
    @classmethod
    def check_email(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            return None
        if value is not None and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value.strip()):
            raise ValueError("must be a valid email")
        return value.strip() if value else value

    @field_validator("person_phone_whatsapp", mode="before")
    @classmethod
    def normalize_phone(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be a string")
        if not value.strip():
            return None
        digits = re.sub(r"\D", "", value)
        if len(digits) not in (10, 11):
            raise ValueError("must contain a Brazilian area code and 10 or 11 digits")
        return digits

    @model_validator(mode="after")
    def validate_request(self):
        if self.consent_privacy is not True:
            raise ValueError("privacy consent is required")
        if not self.person_email and not self.person_phone_whatsapp:
            raise ValueError("provide an email or WhatsApp phone")
        if not any((self.request_reason, self.diagnosis, self.dosage)):
            raise ValueError("provide at least one medication request detail")
        return self


class MedicationReceipt(MedicationSchema):
    protocol: str
    status: MedicationStatus
    submitted_at: datetime
    attachment_count: int = 0


class MedicationStatusPatch(MedicationSchema):
    status: MedicationStatus
    internal_notes: str | None = Field(default=None, max_length=4000)


class MedicationRequestAdminResponse(MedicationSchema):
    id: UUID
    protocol: str
    person_name: str | None
    person_email: str | None
    person_phone_whatsapp: str | None
    cat_name: str | None
    cat_age: str | None
    request_reason: str | None
    diagnosis: str | None
    dosage: str | None
    urgency: MedicationUrgency | None
    pickup_availability: str | None
    consent_privacy: bool
    status: MedicationStatus
    internal_notes: str | None
    submitted_at: datetime
    updated_at: datetime


class MedicationRequestAdminList(MedicationSchema):
    items: list[MedicationRequestAdminResponse]
    total: int
    limit: int
    offset: int
