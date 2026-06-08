from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from pathlib import Path
from uuid import UUID

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from models.address import Address
from models.invoice import Invoice
from models.order import Order, OrderItem
from services.cloudinary import upload_pdf

settings = get_settings()


def _money(value: Decimal) -> str:
    return f"{value:.2f}"


async def generate_invoice_number(db: AsyncSession) -> str:
    year = datetime.utcnow().year
    result = await db.execute(select(Invoice).order_by(Invoice.generated_at.desc()).limit(1))
    last_invoice = result.scalar_one_or_none()
    if not last_invoice:
        sequence = 1
    else:
        try:
            sequence = int(last_invoice.invoice_number.split("-")[-1]) + 1
        except (IndexError, ValueError):
            sequence = 1
    return f"INV-{year}-{sequence:04d}"


def generate_invoice_pdf(
    order: Order,
    order_items: list[OrderItem],
    address: Address,
    invoice_number: str,
    output_dir: str = "tmp_invoices",
) -> tuple[str, str]:
    """Generate invoice PDF and return (local_path, cloud_url)"""
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    file_path = Path(output_dir) / f"{invoice_number}.pdf"

    pdf = canvas.Canvas(str(file_path), pagesize=A4)
    width, height = A4

    y = height - 20 * mm
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(20 * mm, y, settings.BRAND_NAME)
    pdf.setFont("Helvetica", 10)
    y -= 6 * mm
    pdf.drawString(20 * mm, y, settings.BRAND_ADDRESS)

    y -= 10 * mm
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(20 * mm, y, f"Invoice: {invoice_number}")
    y -= 5 * mm
    pdf.setFont("Helvetica", 10)
    pdf.drawString(20 * mm, y, f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}")

    y -= 8 * mm
    pdf.drawString(20 * mm, y, f"Customer: {address.full_name}")
    y -= 5 * mm
    pdf.drawString(20 * mm, y, f"Phone: {address.phone}")
    y -= 5 * mm
    pdf.drawString(20 * mm, y, f"Address: {address.line1}, {address.city}, {address.state} - {address.pincode}")

    y -= 10 * mm
    pdf.setStrokeColor(colors.black)
    pdf.line(20 * mm, y, 190 * mm, y)
    y -= 6 * mm
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(20 * mm, y, "Item")
    pdf.drawString(85 * mm, y, "Variant")
    pdf.drawString(120 * mm, y, "Qty")
    pdf.drawString(135 * mm, y, "Unit")
    pdf.drawString(160 * mm, y, "Total")
    y -= 4 * mm
    pdf.line(20 * mm, y, 190 * mm, y)
    y -= 6 * mm

    pdf.setFont("Helvetica", 10)
    for item in order_items:
        item_total = item.unit_price * item.quantity
        pdf.drawString(20 * mm, y, item.product_name[:28])
        pdf.drawString(85 * mm, y, f"{item.size}/{item.color}"[:18])
        pdf.drawString(120 * mm, y, str(item.quantity))
        pdf.drawRightString(155 * mm, y, _money(item.unit_price))
        pdf.drawRightString(190 * mm, y, _money(item_total))
        y -= 6 * mm
        if y < 50 * mm:
            pdf.showPage()
            y = height - 20 * mm

    y -= 4 * mm
    pdf.line(20 * mm, y, 190 * mm, y)
    y -= 8 * mm
    pdf.drawRightString(160 * mm, y, "Subtotal")
    pdf.drawRightString(190 * mm, y, _money(order.subtotal))
    y -= 6 * mm
    pdf.drawRightString(160 * mm, y, "Discount")
    pdf.drawRightString(190 * mm, y, _money(order.discount_amount))
    y -= 6 * mm
    pdf.drawRightString(160 * mm, y, "Delivery")
    pdf.drawRightString(190 * mm, y, _money(order.delivery_charge))
    y -= 7 * mm
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawRightString(160 * mm, y, "Grand Total")
    pdf.drawRightString(190 * mm, y, _money(order.total_amount))

    y -= 12 * mm
    pdf.setFont("Helvetica-Oblique", 10)
    pdf.drawString(20 * mm, y, "Thank you for shopping with us.")
    pdf.save()
    
    # Upload to Cloudinary
    cloud_url = upload_pdf(str(file_path), f"invoices/{invoice_number}")
    
    return str(file_path), cloud_url
