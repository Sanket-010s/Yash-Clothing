from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CreatePaymentRequest(BaseModel):
    order_id: UUID


class VerifyPaymentRequest(BaseModel):
    order_id: UUID
    razorpay_order_id: str = Field(min_length=3, max_length=100)
    razorpay_payment_id: str = Field(min_length=3, max_length=100)
    razorpay_signature: str = Field(min_length=3, max_length=255)
    method: str | None = Field(default=None, max_length=30)


class PaymentCreateResponse(BaseModel):
    order_id: UUID
    razorpay_order_id: str
    amount: int
    amount_in_inr: Decimal
    currency: str = "INR"


class PaymentOut(BaseModel):
    id: UUID
    order_id: UUID
    razorpay_order_id: str
    razorpay_payment_id: str | None
    razorpay_signature: str | None
    status: str
    method: str | None
    amount: Decimal
    paid_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
