from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class CampaignSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, populate_by_name=True)


class CampaignFields(CampaignSchema):
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1)
    goal_cents: int = Field(ge=0)
    raised_cents: int = Field(default=0, ge=0)
    pix_key: str | None = Field(default=None, max_length=255)
    starts_on: date | None = None
    ends_on: date | None = None
    published: bool = False

    @field_validator("title", "description", mode="before")
    @classmethod
    def trim_required_text(cls, value: object) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must not be blank")
        return value.strip()

    @model_validator(mode="after")
    def validate_dates(self):
        if self.starts_on and self.ends_on and self.ends_on < self.starts_on:
            raise ValueError("endsOn must be on or after startsOn")
        return self


class CampaignCreate(CampaignFields):
    pass


class CampaignPatch(CampaignSchema):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, min_length=1)
    goal_cents: int | None = Field(default=None, ge=0)
    raised_cents: int | None = Field(default=None, ge=0)
    pix_key: str | None = Field(default=None, max_length=255)
    starts_on: date | None = None
    ends_on: date | None = None
    published: bool | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def trim_optional_text(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str) or not value.strip():
            raise ValueError("must not be blank")
        return value.strip()

    @model_validator(mode="after")
    def validate_patch(self):
        if not self.model_fields_set:
            raise ValueError("at least one field must be provided")
        required = {"title", "description", "goal_cents", "raised_cents", "published"}
        for field in self.model_fields_set & required:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        if self.starts_on and self.ends_on and self.ends_on < self.starts_on:
            raise ValueError("endsOn must be on or after startsOn")
        return self


class CampaignResponse(CampaignSchema):
    id: UUID
    title: str
    description: str
    goal_cents: int
    raised_cents: int
    pix_key: str | None
    starts_on: date | None
    ends_on: date | None


class CampaignPublicResponse(CampaignResponse):
    pass


class CampaignAdminResponse(CampaignResponse):
    published: bool
    created_at: datetime
    updated_at: datetime


class CampaignPublicListResponse(CampaignSchema):
    items: list[CampaignPublicResponse]
    total: int
    limit: int
    offset: int


class CampaignAdminListResponse(CampaignSchema):
    items: list[CampaignAdminResponse]
    total: int
    limit: int
    offset: int
