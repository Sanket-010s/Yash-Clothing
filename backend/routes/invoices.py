from __future__ import annotations

from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
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


@router.get("/{order_id}/download")
async def download_invoice(
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
    
    pdf_path = Path("tmp_invoices") / f"{invoice.invoice_number}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file not found")
    
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"{invoice.invoice_number}.pdf"
    )


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
        select(Invoice)
        .options(selectinload(Invoice.order).selectinload(Order.address))
        .order_by(Invoice.generated_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    invoices = result.scalars().all()
    
    response = []
    for inv in invoices:
        response.append(InvoiceOut(
            id=inv.id,
            order_id=inv.order_id,
            invoice_number=inv.invoice_number,
            pdf_url=inv.pdf_url,
            generated_at=inv.generated_at,
            customer_name=inv.order.address.full_name if inv.order and inv.order.address else None,
            amount=inv.order.total_amount if inv.order else None
        ))
    return response


@admin_router.get("/invoices/{order_id}/download")
async def admin_download_invoice(
    order_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Invoice).where(Invoice.order_id == order_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    pdf_path = Path("tmp_invoices") / f"{invoice.invoice_number}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file not found")
    
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"{invoice.invoice_number}.pdf"
    )


@admin_router.post("/invoices/{order_id}/regenerate")
async def regenerate_invoice(
    order_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from services.invoice import generate_invoice_pdf, generate_invoice_number
    
    order_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.address))
        .where(Order.id == order_id)
    )
    order = order_result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if not order.address:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order address missing")
    
    # Get or create invoice record
    invoice_result = await db.execute(select(Invoice).where(Invoice.order_id == order_id))
    invoice = invoice_result.scalar_one_or_none()
    
    if not invoice:
        invoice_number = await generate_invoice_number(db)
        invoice = Invoice(
            order_id=order.id,
            invoice_number=invoice_number,
            pdf_url="",
        )
        db.add(invoice)
        await db.commit()
        await db.refresh(invoice)
    
    try:
        # Generate PDF and upload to Cloudinary
        local_path, cloud_url = generate_invoice_pdf(order, order.items, order.address, invoice.invoice_number)
        invoice.pdf_url = cloud_url
        await db.commit()
        
        return {
            "message": "Invoice regenerated successfully",
            "invoice_number": invoice.invoice_number,
            "pdf_url": invoice.pdf_url,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Invoice generation failed: {str(e)}")


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
