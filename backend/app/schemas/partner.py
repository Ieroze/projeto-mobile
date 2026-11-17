from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.enums import PartnerCategory, PartnerSocialPlatform


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class PartnerSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


def require_text(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError("must be a string")
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("must not be blank")
    return cleaned


class PartnerSocialInput(PartnerSchema):
    platform: PartnerSocialPlatform
    label: str = Field(min_length=1, max_length=80)
    url: str | None = None

    @field_validator("label", mode="before")
    @classmethod
    def clean_label(cls, value: object) -> str:
        return require_text(value)


class PartnerSocialResponse(PartnerSocialInput):
    id: UUID
    position: int


class PartnerFields(PartnerSchema):
    name: str = Field(min_length=1, max_length=160)
    category: PartnerCategory
    description: str = Field(min_length=1)
    position: int = Field(default=0, ge=0)
    published: bool = False
    socials: list[PartnerSocialInput] = Field(default_factory=list, max_length=20)

    @field_validator("name", "description", mode="before")
    @classmethod
    def clean_required_text(cls, value: object) -> str:
        return require_text(value)


class PartnerCreate(PartnerFields):
    pass


class PartnerPatch(PartnerSchema):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    category: PartnerCategory | None = None
    description: str | None = Field(default=None, min_length=1)
    position: int | None = Field(default=None, ge=0)
    published: bool | None = None
    socials: list[PartnerSocialInput] | None = Field(default=None, max_length=20)

    @field_validator("name", "description", mode="before")
    @classmethod
    def clean_optional_text(cls, value: object) -> str | None:
        return require_text(value) if value is not None else value

    @model_validator(mode="after")
    def reject_null_patch_values(self):
        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class PartnerPublicResponse(PartnerSchema):
    id: UUID
    name: str
    category: PartnerCategory
    description: str
    position: int
    socials: list[PartnerSocialResponse]


class PartnerAdminResponse(PartnerPublicResponse):
    published: bool
    created_at: datetime
    updated_at: datetime


class PartnerPublicListResponse(PartnerSchema):
    items: list[PartnerPublicResponse]
    total: int
    limit: int
    offset: int


class PartnerAdminListResponse(PartnerSchema):
    items: list[PartnerAdminResponse]
    total: int
    limit: int
    offset: int
