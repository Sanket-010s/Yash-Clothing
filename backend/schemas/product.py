from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class VariantCreate(BaseModel):
    size: str = Field(min_length=1, max_length=10)
    color: str = Field(min_length=1, max_length=50)
    color_hex: str | None = Field(default=None, min_length=4, max_length=7)
    stock: int = Field(default=0, ge=0)
    price_override: Decimal | None = Field(default=None, ge=0)


class VariantUpdate(BaseModel):
    size: str | None = Field(default=None, min_length=1, max_length=10)
    color: str | None = Field(default=None, min_length=1, max_length=50)
    color_hex: str | None = Field(default=None, min_length=4, max_length=7)
    stock: int | None = Field(default=None, ge=0)
    price_override: Decimal | None = Field(default=None, ge=0)


class VariantOut(BaseModel):
    id: UUID
    product_id: UUID
    size: str
    color: str
    color_hex: str | None
    stock: int
    price_override: Decimal | None

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    base_price: Decimal = Field(ge=0)
    sale_price: Decimal | None = Field(default=None, ge=0)
    category: str = Field(min_length=2, max_length=100)
    images: list[str] = Field(min_length=1)
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    base_price: Decimal | None = Field(default=None, ge=0)
    sale_price: Decimal | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    images: list[str] | None = None
    is_active: bool | None = None


class ProductOut(BaseModel):
    id: UUID
    name: str
    description: str | None
    base_price: Decimal
    sale_price: Decimal | None
    category: str
    images: list[str]
    is_active: bool
    created_at: datetime
    variants: list[VariantOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
