from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from models.coupon import Coupon
from models.invoice import Invoice
from models.order import Order
from models.payment import Payment
from models.user import User
from schemas.payment import CreatePaymentRequest, PaymentCreateResponse, VerifyPaymentRequest
from services.cloudinary import upload_pdf
from services.email import send_order_confirmation_email
from services.invoice import generate_invoice_number, generate_invoice_pdf
from services.razorpay import create_razorpay_order, verify_razorpay_signature

router = APIRouter(prefix="/api/payment", tags=["Payment"])


@router.post("/create", response_model=PaymentCreateResponse)
async def create_payment_order(payload: CreatePaymentRequest, db: AsyncSession = Depends(get_db)):
    order_result = await db.execute(select(Order).where(Order.id == payload.order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    razorpay_order = create_razorpay_order(str(order.id), order.total_amount)
    razorpay_order_id = razorpay_order["id"]

    payment_result = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = payment_result.scalar_one_or_none()
    if payment:
        payment.razorpay_order_id = razorpay_order_id
        payment.amount = order.total_amount
        payment.status = "pending"
    else:
        payment = Payment(
            order_id=order.id,
            razorpay_order_id=razorpay_order_id,
            amount=order.total_amount,
            status="pending",
        )
        db.add(payment)

    await db.commit()
    return PaymentCreateResponse(
        order_id=order.id,
        razorpay_order_id=razorpay_order_id,
        amount=int(order.total_amount * 100),
        amount_in_inr=order.total_amount,
    )


@router.post("/verify")
async def verify_payment(payload: VerifyPaymentRequest, db: AsyncSession = Depends(get_db)):
    order_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address), selectinload(Order.user))
        .where(Order.id == payload.order_id)
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    payment_result = await db.execute(select(Payment).where(Payment.order_id == order.id))
    payment = payment_result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")
    if payment.razorpay_order_id != payload.razorpay_order_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Razorpay order mismatch")

    is_valid = verify_razorpay_signature(
        payload.razorpay_order_id,
        payload.razorpay_payment_id,
        payload.razorpay_signature,
    )
    if not is_valid:
        payment.status = "failed"
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment signature")

    payment.razorpay_payment_id = payload.razorpay_payment_id
    payment.razorpay_signature = payload.razorpay_signature
    payment.method = payload.method
    payment.status = "success"
    payment.paid_at = datetime.utcnow()

    order.status = "confirmed"

    if order.coupon_code:
        coupon_result = await db.execute(select(Coupon).where(Coupon.code == order.coupon_code))
        coupon = coupon_result.scalar_one_or_none()
        if coupon:
            coupon.used_count += 1

    invoice_result = await db.execute(select(Invoice).where(Invoice.order_id == order.id))
    invoice = invoice_result.scalar_one_or_none()
    if not invoice:
        invoice_number = await generate_invoice_number(db)
        if not order.address:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order address missing")
        pdf_path = generate_invoice_pdf(order, order.items, order.address, invoice_number)
        pdf_url = upload_pdf(pdf_path, public_id=invoice_number)
        invoice = Invoice(
            order_id=order.id,
            invoice_number=invoice_number,
            pdf_url=pdf_url,
        )
        db.add(invoice)

    await db.commit()
    await db.refresh(invoice)

    customer_email = order.user.email if isinstance(order.user, User) else order.guest_email
    if customer_email:
        send_order_confirmation_email(
            to_email=customer_email,
            subject=f"Order Confirmed #{order.id}",
            plain_body=f"Your order {order.id} has been confirmed.",
        )

    return {
        "message": "Payment verified successfully",
        "order_id": str(order.id),
        "payment_status": payment.status,
        "order_status": order.status,
        "invoice_url": invoice.pdf_url,
    }
