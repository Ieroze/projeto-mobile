from datetime import date, datetime
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.models.enums import AdoptionStatus, CareStatus

def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)

class PublicSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)

class CatPhotoPublicResponse(PublicSchema):
    id: UUID
    url: str
    alt_text: str | None
    position: int
    is_cover: bool

class CatPublicResponse(PublicSchema):
    id: UUID
    name: str
    sex: Literal["female", "male"]
    birth_date: date | None
    approximate_age_months: int | None
    short_description: str | None
    description: str | None
    adoption_status: AdoptionStatus
    care_status: CareStatus
    castrated: bool
    vaccinated: bool
    fiv_felv_negative: bool | None
    traits: list[str]
    cover_photo: CatPhotoPublicResponse | None
    photos: list[CatPhotoPublicResponse]

class CatListResponse(PublicSchema):
    items: list[CatPublicResponse]
    total: int
    limit: int
    offset: int

class CatAdminCreate(PublicSchema):
    name: str = Field(min_length=1, max_length=100)
    sex: Literal["female", "male"]
    birth_date: date | None = None
    approximate_age_months: int | None = Field(default=None, ge=0)
    short_description: str | None = Field(default=None, max_length=280)
    description: str | None = None
    adoption_status: AdoptionStatus = AdoptionStatus.NOT_AVAILABLE
    care_status: CareStatus = CareStatus.HEALTHY
    castrated: bool = False
    vaccinated: bool = False
    fiv_felv_negative: bool | None = None
    traits: list[str] = Field(default_factory=list)
    published: bool = False

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("name must be a string")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be blank")
        return cleaned

class CatAdminPatch(PublicSchema):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    sex: Literal["female", "male"] | None = None
    birth_date: date | None = None
    approximate_age_months: int | None = Field(default=None, ge=0)
    short_description: str | None = Field(default=None, max_length=280)
    description: str | None = None
    adoption_status: AdoptionStatus | None = None
    care_status: CareStatus | None = None
    castrated: bool | None = None
    vaccinated: bool | None = None
    fiv_felv_negative: bool | None = None
    traits: list[str] | None = None
    published: bool | None = None

    @field_validator("name", mode="before")
    @classmethod
    def clean_name(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("name must be a string")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be blank")
        return cleaned

    @model_validator(mode="after")
    def reject_null_required_fields(self):
        nullable = {"birth_date", "approximate_age_months", "short_description", "description", "fiv_felv_negative"}
        for field in self.model_fields_set - nullable:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        return self

class CatAdminResponse(CatPublicResponse):
    published: bool
    created_at: datetime
    updated_at: datetime

class CatAdminListResponse(PublicSchema):
    items: list[CatAdminResponse]
    total: int
    limit: int
    offset: int
