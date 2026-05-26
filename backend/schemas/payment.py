from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


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
