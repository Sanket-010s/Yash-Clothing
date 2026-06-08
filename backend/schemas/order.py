from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from schemas.address import AddressOut
from schemas.auth import UserOut
from schemas.invoice import InvoiceOut
from schemas.payment import PaymentOut


class AddressInput(BaseModel):
    label: str = Field(default="Home", max_length=20)
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=8, max_length=15)
    line1: str = Field(min_length=5, max_length=255)
    line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=10)


class OrderItemInput(BaseModel):
    variant_id: UUID
    quantity: int = Field(ge=1, le=20)
    design_id: UUID | None = None


class CreateOrderRequest(BaseModel):
    items: list[OrderItemInput] | None = None
    address_id: UUID | None = None
    address: AddressInput | None = None
    coupon_code: str | None = Field(default=None, max_length=50)
    guest_email: EmailStr | None = None
    guest_phone: str | None = Field(default=None, max_length=15)


class OrderItemOut(BaseModel):
    id: UUID
    product_id: UUID | None
    variant_id: UUID
    design_id: UUID | None
    quantity: int
    unit_price: Decimal
    product_name: str
    size: str
    color: str

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: UUID
    user_id: UUID | None
    guest_email: str | None
    guest_phone: str | None
    address_id: UUID | None
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    delivery_charge: Decimal
    total_amount: Decimal
    coupon_code: str | None
    created_at: datetime
    items: list[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)


class OrderDetailOut(BaseModel):
    id: UUID
    user_id: UUID | None
    guest_email: str | None
    guest_phone: str | None
    address_id: UUID | None
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    delivery_charge: Decimal
    total_amount: Decimal
    coupon_code: str | None
    created_at: datetime
    items: list[OrderItemOut]
    address: AddressOut | None = None
    user: UserOut | None = None
    payment: PaymentOut | None = None
    invoice: InvoiceOut | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(pattern="^(pending|confirmed|shipped|delivered|cancelled)$")
