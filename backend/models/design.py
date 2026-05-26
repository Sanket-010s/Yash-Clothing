from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base


class CustomDesign(Base):
    __tablename__ = "custom_designs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    canvas_json: Mapped[str] = mapped_column(Text, nullable=False)
    preview_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    shirt_color: Mapped[str] = mapped_column(String(7), default="#FFFFFF", nullable=False)
    name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="custom_designs")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="design")
    cart_items: Mapped[list["CartItem"]] = relationship("CartItem", back_populates="design")
