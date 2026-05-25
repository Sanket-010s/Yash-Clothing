from datetime import datetime

from pydantic import BaseModel


class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: float
    mrp: float
    stock: int
    image_url: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
