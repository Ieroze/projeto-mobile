from datetime import date
from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict
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
