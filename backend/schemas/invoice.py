from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InvoiceOut(BaseModel):
    id: UUID
    order_id: UUID
    invoice_number: str
    pdf_url: str
    generated_at: datetime
    customer_name: str | None = None
    amount: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
