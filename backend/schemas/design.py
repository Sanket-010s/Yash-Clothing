from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DesignCreate(BaseModel):
    canvas_json: str = Field(min_length=2)
    preview_url: str | None = Field(default=None, max_length=500)
    shirt_color: str = Field(default="#FFFFFF", min_length=4, max_length=7)
    name: str | None = Field(default=None, max_length=100)


class DesignOut(BaseModel):
    id: UUID
    user_id: UUID
    canvas_json: str
    preview_url: str | None
    shirt_color: str
    name: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
