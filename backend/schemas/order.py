from datetime import datetime

from pydantic import BaseModel, Field


class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=20)
    size: str = Field(default="M", min_length=1, max_length=20)
    color: str = Field(default="Black", min_length=1, max_length=30)


class AddressInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=8, max_length=20)
    line1: str = Field(min_length=5, max_length=200)
    city: str = Field(min_length=2, max_length=80)
    state: str = Field(min_length=2, max_length=80)
    pincode: str = Field(min_length=4, max_length=12)


class CreateOrderRequest(BaseModel):
    items: list[OrderItemInput]
    address: AddressInput
    coupon_code: str | None = None


class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    size: str
    color: str

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    status: str
    payment_status: str
    subtotal: float
    gst_amount: float
    delivery_amount: float
    discount_amount: float
    total_amount: float
    created_at: datetime
    items: list[OrderItemOut]

    class Config:
        from_attributes = True
