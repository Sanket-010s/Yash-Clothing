from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from middleware.admin import get_current_admin
from middleware.auth import get_current_user
from models.invoice import Invoice
from models.order import Order
from models.user import User
from schemas.invoice import InvoiceOut

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Invoices"])


@router.get("/{order_id}", response_model=InvoiceOut)
async def get_my_invoice(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order_result = await db.execute(select(Order).where(Order.id == order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    invoice_result = await db.execute(select(Invoice).where(Invoice.order_id == order_id))
    invoice = invoice_result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not generated yet")
    return invoice


@admin_router.get("/invoices", response_model=list[InvoiceOut])
async def list_invoices(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).order_by(Invoice.generated_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    return result.scalars().all()


@admin_router.get("/invoices/{order_id}", response_model=InvoiceOut)
async def get_invoice_by_order(
    order_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Invoice).where(Invoice.order_id == order_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice
