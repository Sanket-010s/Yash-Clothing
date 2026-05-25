from pydantic import BaseModel


class CreatePaymentRequest(BaseModel):
    order_id: int


class VerifyPaymentRequest(BaseModel):
    order_id: int
    payment_id: str
    signature: str
