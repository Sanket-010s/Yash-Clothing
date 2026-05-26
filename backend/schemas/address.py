from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AddressCreate(BaseModel):
    label: str = Field(default="Home", max_length=20)
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=8, max_length=15)
    line1: str = Field(min_length=5, max_length=255)
    line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: str | None = Field(default=None, max_length=20)
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, min_length=8, max_length=15)
    line1: str | None = Field(default=None, min_length=5, max_length=255)
    line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=100)
    state: str | None = Field(default=None, min_length=2, max_length=100)
    pincode: str | None = Field(default=None, min_length=4, max_length=10)
    is_default: bool | None = None


class AddressOut(BaseModel):
    id: UUID
    user_id: UUID | None
    label: str
    full_name: str
    phone: str
    line1: str
    line2: str | None
    city: str
    state: str
    pincode: str
    is_default: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
