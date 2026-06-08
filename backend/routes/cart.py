from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from middleware.auth import get_current_user
from models.cart import CartItem
from models.coupon import Coupon
from models.design import CustomDesign
from models.product import Product, Variant
from models.user import User
from schemas.cart import (
    CartApplyCouponRequest,
    CartItemAddRequest,
    CartItemOut,
    CartItemUpdateRequest,
    CartSummaryOut,
)
from services.pricing import calculate_coupon_discount, compute_order_totals, effective_variant_price, is_coupon_usable, money

router = APIRouter(prefix="/api/cart", tags=["Cart"])


def _calculate_item_totals(variant: Variant, product: Product, quantity: int) -> Decimal:
    unit_price = effective_variant_price(product, variant)
    line_total = money(unit_price * quantity)
    return line_total


async def _build_cart_summary(db: AsyncSession, user_id: UUID, coupon_code: str | None = None) -> CartSummaryOut:
    result = await db.execute(
        select(CartItem)
        .options(
            selectinload(CartItem.variant).selectinload(Variant.product),
            selectinload(CartItem.product),
        )
        .where(CartItem.user_id == user_id)
    )
    cart_items = result.scalars().all()

    subtotal = Decimal("0.00")
    response_items: list[CartItemOut] = []

    for item in cart_items:
        variant = item.variant
        product = item.product or (variant.product if variant else None)
        if not variant or not product:
            continue
        unit_price = effective_variant_price(product, variant)
        line_total = _calculate_item_totals(variant, product, item.quantity)
        subtotal += line_total
        response_items.append(
            CartItemOut(
                id=item.id,
                product_id=product.id,
                variant_id=variant.id,
                design_id=item.design_id,
                quantity=item.quantity,
                unit_price=unit_price,
                product_name=product.name,
                size=variant.size,
                color=variant.color,
                image=product.images[0] if product.images else None,
            )
        )

    subtotal = money(subtotal)
    discount = Decimal("0.00")
    applied_coupon = None

    if coupon_code:
        coupon_result = await db.execute(select(Coupon).where(Coupon.code == coupon_code.upper()))
        coupon = coupon_result.scalar_one_or_none()
        if coupon:
            usable, _ = is_coupon_usable(coupon, subtotal)
            if usable:
                discount = calculate_coupon_discount(coupon, subtotal)
                applied_coupon = coupon.code

    delivery_charge, total_amount = compute_order_totals(subtotal, discount)
    return CartSummaryOut(
        items=response_items,
        subtotal=subtotal,
        discount_amount=money(discount),
        delivery_charge=delivery_charge,
        total_amount=total_amount,
        coupon_code=applied_coupon,
    )


@router.get("", response_model=CartSummaryOut)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _build_cart_summary(db, current_user.id)


@router.post("/add", response_model=CartSummaryOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    payload: CartItemAddRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    variant_result = await db.execute(select(Variant).options(selectinload(Variant.product)).where(Variant.id == payload.variant_id))
    variant = variant_result.scalar_one_or_none()
    if not variant or not variant.product or not variant.product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")

    if payload.design_id:
        design_result = await db.execute(
            select(CustomDesign).where(CustomDesign.id == payload.design_id, CustomDesign.user_id == current_user.id)
        )
        if not design_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

    existing_result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.variant_id == payload.variant_id,
            CartItem.design_id == payload.design_id,
        )
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        existing.quantity += payload.quantity
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                product_id=variant.product_id,
                variant_id=variant.id,
                design_id=payload.design_id,
                quantity=payload.quantity,
            )
        )

    await db.commit()
    return await _build_cart_summary(db, current_user.id)


@router.put("/{item_id}", response_model=CartSummaryOut)
async def update_item(
    item_id: UUID,
    payload: CartItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.user_id == current_user.id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    item.quantity = payload.quantity
    await db.commit()
    return await _build_cart_summary(db, current_user.id)


@router.delete("/{item_id}", response_model=CartSummaryOut)
async def remove_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.user_id == current_user.id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    await db.delete(item)
    await db.commit()
    return await _build_cart_summary(db, current_user.id)


@router.post("/apply-coupon", response_model=CartSummaryOut)
async def apply_coupon(
    payload: CartApplyCouponRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart_summary = await _build_cart_summary(db, current_user.id)
    coupon_result = await db.execute(select(Coupon).where(Coupon.code == payload.code.upper()))
    coupon = coupon_result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")

    usable, reason = is_coupon_usable(coupon, cart_summary.subtotal)
    if not usable:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason or "Coupon is not valid")

    return await _build_cart_summary(db, current_user.id, coupon.code)


@router.delete("/coupon", response_model=CartSummaryOut)
async def remove_coupon(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await _build_cart_summary(db, current_user.id)
