from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    code: str = Field(min_length=2, max_length=50)
    type: str = Field(pattern="^(percent|flat)$")
    value: Decimal = Field(ge=0)
    min_order_value: Decimal = Field(default=0, ge=0)
    max_discount: Decimal | None = Field(default=None, ge=0)
    max_uses: int = Field(ge=1)
    expires_at: datetime
    is_active: bool = True


class CouponUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=50)
    type: str | None = Field(default=None, pattern="^(percent|flat)$")
    value: Decimal | None = Field(default=None, ge=0)
    min_order_value: Decimal | None = Field(default=None, ge=0)
    max_discount: Decimal | None = Field(default=None, ge=0)
    max_uses: int | None = Field(default=None, ge=1)
    expires_at: datetime | None = None
    is_active: bool | None = None


class CouponOut(BaseModel):
    id: UUID
    code: str
    type: str
    value: Decimal
    min_order_value: Decimal
    max_discount: Decimal | None
    max_uses: int
    used_count: int
    expires_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
