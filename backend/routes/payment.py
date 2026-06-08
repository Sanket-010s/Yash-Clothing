from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import get_settings
from database.db import get_db
from models.coupon import Coupon
from models.invoice import Invoice
from models.order import Order
from models.payment import Payment
from models.user import User
from schemas.payment import CreatePaymentRequest, PaymentCreateResponse, VerifyPaymentRequest
from services.email import send_order_confirmation_email
from services.invoice import generate_invoice_number, generate_invoice_pdf
from services.razorpay import create_razorpay_order, verify_razorpay_signature

settings = get_settings()

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
    try:
        print(f"Payment verification started for order: {payload.order_id}")
        
        order_result = await db.execute(
            select(Order)
            .options(selectinload(Order.items), selectinload(Order.address), selectinload(Order.user))
            .where(Order.id == payload.order_id)
        )
        order = order_result.scalar_one_or_none()
        if not order:
            print(f"Order not found: {payload.order_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        payment_result = await db.execute(select(Payment).where(Payment.order_id == order.id))
        payment = payment_result.scalar_one_or_none()
        if not payment:
            print(f"Payment record not found for order: {order.id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")
        if payment.razorpay_order_id != payload.razorpay_order_id:
            print(f"Razorpay order mismatch: expected {payment.razorpay_order_id}, got {payload.razorpay_order_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Razorpay order mismatch")

        print(f"Verifying Razorpay signature...")
        is_valid = verify_razorpay_signature(
            payload.razorpay_order_id,
            payload.razorpay_payment_id,
            payload.razorpay_signature,
        )
        if not is_valid:
            print(f"Invalid payment signature for order: {order.id}")
            payment.status = "failed"
            await db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment signature")

        print(f"Payment signature verified successfully")
        payment.razorpay_payment_id = payload.razorpay_payment_id
        payment.razorpay_signature = payload.razorpay_signature
        payment.method = payload.method
        payment.status = "success"
        payment.paid_at = datetime.utcnow()

        order.status = "confirmed"
        print(f"Order status updated to confirmed: {order.id}")

        if order.coupon_code:
            coupon_result = await db.execute(select(Coupon).where(Coupon.code == order.coupon_code))
            coupon = coupon_result.scalar_one_or_none()
            if coupon:
                coupon.used_count += 1
                print(f"Coupon usage updated: {order.coupon_code}")

        invoice_result = await db.execute(select(Invoice).where(Invoice.order_id == order.id))
        invoice = invoice_result.scalar_one_or_none()
        if not invoice:
            print(f"Generating invoice for order: {order.id}")
            invoice_number = await generate_invoice_number(db)
            if not order.address:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order address missing")
            
            try:
                # Generate PDF and upload to Cloudinary
                local_path, cloud_url = generate_invoice_pdf(order, order.items, order.address, invoice_number)
                print(f"Invoice generated: {local_path}, Cloud URL: {cloud_url}")
                
                invoice = Invoice(
                    order_id=order.id,
                    invoice_number=invoice_number,
                    pdf_url=cloud_url,  # Use Cloudinary URL
                )
                db.add(invoice)
            except Exception as e:
                print(f"Invoice generation failed: {str(e)}")
                # Fallback to local URL if Cloudinary fails
                local_path, _ = generate_invoice_pdf(order, order.items, order.address, invoice_number)
                fallback_url = f"{settings.FRONTEND_URL.replace('3000', '8000')}/api/invoices/{order.id}/download"
                invoice = Invoice(
                    order_id=order.id,
                    invoice_number=invoice_number,
                    pdf_url=fallback_url,
                )
                db.add(invoice)
        else:
            print(f"Invoice already exists: {invoice.invoice_number}")

        await db.commit()
        await db.refresh(invoice)
        print(f"Payment verification completed successfully for order: {order.id}")

        customer_email = order.user.email if isinstance(order.user, User) else order.guest_email
        if customer_email:
            try:
                send_order_confirmation_email(
                    to_email=customer_email,
                    subject=f"Order Confirmed #{order.id}",
                    plain_body=f"Your order {order.id} has been confirmed.",
                )
                print(f"Confirmation email sent to: {customer_email}")
            except Exception as e:
                print(f"Failed to send confirmation email: {str(e)}")

        return {
            "message": "Payment verified successfully",
            "order_id": str(order.id),
            "payment_status": payment.status,
            "order_status": order.status,
            "invoice_url": invoice.pdf_url,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Payment verification failed")
