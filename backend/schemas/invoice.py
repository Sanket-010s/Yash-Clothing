from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InvoiceOut(BaseModel):
    id: UUID
    order_id: UUID
    invoice_number: str
    pdf_url: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
