from __future__ import annotations

import hmac
import hashlib
from datetime import datetime
from decimal import Decimal

from config import get_settings

settings = get_settings()

try:
    import razorpay  # type: ignore
except ImportError:  # pragma: no cover
    razorpay = None


def _get_client():
    if not razorpay or not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        return None
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_razorpay_order(order_id: str, amount_in_inr: Decimal) -> dict:
    amount_paise = int(amount_in_inr * 100)
    client = _get_client()
    if not client:
        return {
            "id": f"test_order_{order_id}_{int(datetime.utcnow().timestamp())}",
            "amount": amount_paise,
            "currency": "INR",
        }

    return client.order.create(
        {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": order_id,
            "payment_capture": 1,
        }
    )


def verify_razorpay_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    if not settings.RAZORPAY_KEY_SECRET or razorpay_order_id.startswith("test_order_"):
        return True

    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
    digest = hmac.new(settings.RAZORPAY_KEY_SECRET.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, razorpay_signature)
