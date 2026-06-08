from __future__ import annotations

from datetime import date, datetime, time
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from middleware.admin import get_current_admin
from models.order import Order
from models.product import Variant
from schemas.order import OrderDetailOut, OrderOut, OrderStatusUpdateRequest

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/orders", response_model=list[OrderOut])
async def list_orders(
    status_filter: str | None = Query(default=None, alias="status"),
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).options(selectinload(Order.items))

    if status_filter:
        query = query.where(Order.status == status_filter)
    if date_from:
        query = query.where(Order.created_at >= datetime.combine(date_from, time.min))
    if date_to:
        query = query.where(Order.created_at <= datetime.combine(date_to, time.max))

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/orders/{order_id}", response_model=OrderDetailOut)
async def get_order(
    order_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.address),
            selectinload(Order.user),
            selectinload(Order.payment),
            selectinload(Order.invoice)
        )
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    payload: OrderStatusUpdateRequest,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    await db.commit()
    return {"message": "Order status updated", "order_id": str(order.id), "status": order.status}


@router.get("/stats")
async def admin_stats(
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)

    orders_today_result = await db.execute(
        select(func.count(Order.id)).where(func.date(Order.created_at) == today)
    )
    orders_today = orders_today_result.scalar_one() or 0

    revenue_today_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            and_(
                func.date(Order.created_at) == today,
                Order.status.in_(["confirmed", "shipped", "delivered"]),
            )
        )
    )
    revenue_today = Decimal(str(revenue_today_result.scalar_one() or 0))

    revenue_month_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            and_(
                func.date(Order.created_at) >= month_start,
                Order.status.in_(["confirmed", "shipped", "delivered"]),
            )
        )
    )
    revenue_this_month = Decimal(str(revenue_month_result.scalar_one() or 0))

    pending_orders_result = await db.execute(select(func.count(Order.id)).where(Order.status == "pending"))
    pending_orders = pending_orders_result.scalar_one() or 0

    low_stock_result = await db.execute(
        select(Variant).options(selectinload(Variant.product)).where(Variant.stock < 5).order_by(Variant.stock.asc())
    )
    low_stock_variants = [
        {
            "variant_id": str(variant.id),
            "product_id": str(variant.product_id),
            "product_name": variant.product.name if variant.product else "",
            "size": variant.size,
            "color": variant.color,
            "stock": variant.stock,
        }
        for variant in low_stock_result.scalars().all()
    ]

    return {
        "orders_today": orders_today,
        "revenue_today": revenue_today,
        "revenue_this_month": revenue_this_month,
        "pending_orders": pending_orders,
        "low_stock_variants": low_stock_variants,
    }
