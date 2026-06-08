from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class CartItemAddRequest(BaseModel):
    variant_id: UUID
    quantity: int = Field(default=1, ge=1, le=20)
    design_id: UUID | None = None


class CartItemUpdateRequest(BaseModel):
    quantity: int = Field(ge=1, le=20)


class CartApplyCouponRequest(BaseModel):
    code: str = Field(min_length=2, max_length=50)


class CartItemOut(BaseModel):
    id: UUID
    product_id: UUID | None
    variant_id: UUID
    design_id: UUID | None
    quantity: int
    unit_price: Decimal
    product_name: str
    size: str
    color: str
    image: str | None


class CartSummaryOut(BaseModel):
    items: list[CartItemOut]
    subtotal: Decimal
    discount_amount: Decimal
    delivery_charge: Decimal
    total_amount: Decimal
    coupon_code: str | None
