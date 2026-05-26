from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from middleware.auth import get_current_user, get_optional_user
from models.address import Address
from models.cart import CartItem
from models.coupon import Coupon
from models.design import CustomDesign
from models.order import Order, OrderItem
from models.product import Variant
from models.user import User
from schemas.order import CreateOrderRequest, OrderItemInput, OrderOut
from services.pricing import (
    calculate_coupon_discount,
    compute_order_totals,
    effective_variant_price,
    is_coupon_usable,
    line_gst_rate,
    money,
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])


async def _resolve_order_address(
    payload: CreateOrderRequest,
    current_user: User | None,
    db: AsyncSession,
) -> Address:
    if payload.address_id:
        address_result = await db.execute(select(Address).where(Address.id == payload.address_id))
        address = address_result.scalar_one_or_none()
        if not address:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
        if current_user and address.user_id not in (None, current_user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Address does not belong to user")
        return address

    if not payload.address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Address details are required")

    address = Address(
        user_id=current_user.id if current_user else None,
        label=payload.address.label,
        full_name=payload.address.full_name,
        phone=payload.address.phone,
        line1=payload.address.line1,
        line2=payload.address.line2,
        city=payload.address.city,
        state=payload.address.state,
        pincode=payload.address.pincode,
        is_default=False,
    )
    db.add(address)
    await db.flush()
    return address


async def _collect_items_from_cart(user_id: UUID, db: AsyncSession) -> list[OrderItemInput]:
    cart_result = await db.execute(select(CartItem).where(CartItem.user_id == user_id))
    cart_items = cart_result.scalars().all()
    return [OrderItemInput(variant_id=item.variant_id, quantity=item.quantity, design_id=item.design_id) for item in cart_items]


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: CreateOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    if not current_user and (not payload.guest_email or not payload.guest_phone):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guest email and phone are required")

    items_input = payload.items or (await _collect_items_from_cart(current_user.id, db) if current_user else [])
    if not items_input:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No items provided")

    address = await _resolve_order_address(payload, current_user, db)

    subtotal = Decimal("0.00")
    gst_amount = Decimal("0.00")
    order_items: list[OrderItem] = []

    for item in items_input:
        variant_result = await db.execute(select(Variant).options(selectinload(Variant.product)).where(Variant.id == item.variant_id))
        variant = variant_result.scalar_one_or_none()
        product = variant.product if variant else None
        if not variant or not product or not product.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Variant {item.variant_id} not found")
        if variant.stock < item.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient stock for {product.name}")

        if item.design_id:
            if not current_user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guest orders cannot include saved designs")
            design_result = await db.execute(
                select(CustomDesign).where(CustomDesign.id == item.design_id, CustomDesign.user_id == current_user.id)
            )
            if not design_result.scalar_one_or_none():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

        unit_price = effective_variant_price(product, variant)
        line_total = money(unit_price * item.quantity)
        line_gst = money(line_total * line_gst_rate(line_total))
        subtotal += line_total
        gst_amount += line_gst
        variant.stock -= item.quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                variant_id=variant.id,
                design_id=item.design_id,
                quantity=item.quantity,
                unit_price=unit_price,
                product_name=product.name,
                size=variant.size,
                color=variant.color,
            )
        )

    subtotal = money(subtotal)
    gst_amount = money(gst_amount)
    discount_amount = Decimal("0.00")
    coupon_code: str | None = None

    if payload.coupon_code:
        coupon_result = await db.execute(select(Coupon).where(Coupon.code == payload.coupon_code.upper()))
        coupon = coupon_result.scalar_one_or_none()
        if not coupon:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
        usable, reason = is_coupon_usable(coupon, subtotal)
        if not usable:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason or "Coupon is invalid")
        discount_amount = calculate_coupon_discount(coupon, subtotal)
        coupon_code = coupon.code

    delivery_charge, total_amount = compute_order_totals(subtotal, gst_amount, discount_amount)

    order = Order(
        user_id=current_user.id if current_user else None,
        guest_email=payload.guest_email,
        guest_phone=payload.guest_phone,
        address_id=address.id,
        status="pending",
        subtotal=subtotal,
        gst_amount=gst_amount,
        discount_amount=money(discount_amount),
        delivery_charge=delivery_charge,
        total_amount=total_amount,
        coupon_code=coupon_code,
        items=order_items,
    )

    db.add(order)
    if current_user and not payload.items:
        await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))

    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result.scalar_one()


@router.get("", response_model=list[OrderOut])
async def list_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return order
