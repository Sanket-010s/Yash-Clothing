from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.order import Order
from schemas.payment import CreatePaymentRequest, VerifyPaymentRequest

router = APIRouter(prefix="/api/payment", tags=["Payment"])


@router.post("/create")
def create_payment_order(payload: CreatePaymentRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Placeholder response until Razorpay integration is added.
    razorpay_order_id = f"test_rzp_{order.id}_{int(datetime.utcnow().timestamp())}"
    return {
        "order_id": order.id,
        "razorpay_order_id": razorpay_order_id,
        "amount": int(order.total_amount * 100),
        "currency": "INR",
    }


@router.post("/verify")
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Temporary verification for development bootstrap.
    order.payment_status = "PAID"
    order.status = "CONFIRMED"
    db.commit()

    return {
        "message": "Payment verified",
        "order_id": order.id,
        "payment_id": payload.payment_id,
    }
