from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from schemas.product import ProductOut


class WishlistOut(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    created_at: datetime
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)
