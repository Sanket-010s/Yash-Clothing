from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from models.coupon import Coupon
from models.product import Product, Variant

MONEY_QUANT = Decimal("0.01")
FREE_DELIVERY_THRESHOLD = Decimal("999.00")
MAHARASHTRA_DELIVERY_CHARGE = Decimal("65.00")
DEFAULT_DELIVERY_CHARGE = Decimal("75.00")


def money(value: Decimal | int | float | str) -> Decimal:
    decimal_value = value if isinstance(value, Decimal) else Decimal(str(value))
    return decimal_value.quantize(MONEY_QUANT, rounding=ROUND_HALF_UP)


def effective_variant_price(product: Product, variant: Variant) -> Decimal:
    if variant.price_override is not None:
        return money(variant.price_override)
    if product.sale_price is not None:
        return money(product.sale_price)
    return money(product.base_price)


def calculate_coupon_discount(coupon: Coupon, subtotal: Decimal) -> Decimal:
    subtotal = money(subtotal)
    if coupon.type == "flat":
        return money(min(subtotal, coupon.value))
    percent_discount = subtotal * (coupon.value / Decimal("100"))
    if coupon.max_discount is not None:
        percent_discount = min(percent_discount, coupon.max_discount)
    return money(min(subtotal, percent_discount))


def is_coupon_usable(coupon: Coupon, subtotal: Decimal) -> tuple[bool, str | None]:
    now = datetime.now(timezone.utc)
    expires_at = coupon.expires_at.replace(tzinfo=timezone.utc) if coupon.expires_at.tzinfo is None else coupon.expires_at
    if not coupon.is_active:
        return False, "Coupon is not active"
    if expires_at < now:
        return False, "Coupon has expired"
    if coupon.used_count >= coupon.max_uses:
        return False, "Coupon usage limit reached"
    if money(subtotal) < money(coupon.min_order_value):
        return False, "Cart total does not meet minimum order value"
    return True, None


def compute_order_totals(subtotal: Decimal, discount_amount: Decimal, state: str | None = None) -> tuple[Decimal, Decimal]:
    subtotal = money(subtotal)
    discount_amount = money(discount_amount)
    
    if subtotal >= FREE_DELIVERY_THRESHOLD:
        delivery_charge = Decimal("0.00")
    elif state and state.lower() == "maharashtra":
        delivery_charge = MAHARASHTRA_DELIVERY_CHARGE
    else:
        delivery_charge = DEFAULT_DELIVERY_CHARGE
    
    total_amount = money(subtotal + delivery_charge - discount_amount)
    return money(delivery_charge), total_amount
