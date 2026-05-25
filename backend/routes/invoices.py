from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.invoice import Invoice
from models.order import Order
from models.user import User
from services.dependencies import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.get("/{order_id}")
def get_invoice(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    invoice = db.query(Invoice).filter(Invoice.order_id == order_id).first()
    if not invoice:
        return {
            "order_id": order_id,
            "invoice_status": "pending",
            "message": "Invoice generation will be added in next phase.",
        }

    return {
        "order_id": order_id,
        "invoice_number": invoice.invoice_number,
        "pdf_url": invoice.pdf_url,
        "generated_at": invoice.generated_at,
    }
