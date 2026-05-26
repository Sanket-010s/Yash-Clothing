from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    sale_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    images: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    variants: Mapped[list["Variant"]] = relationship("Variant", back_populates="product", cascade="all, delete-orphan")
    wishlist_entries: Mapped[list["Wishlist"]] = relationship("Wishlist", back_populates="product")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")
    cart_items: Mapped[list["CartItem"]] = relationship("CartItem", back_populates="product")


class Variant(Base):
    __tablename__ = "variants"
    __table_args__ = (UniqueConstraint("product_id", "size", "color", name="uq_variant_product_size_color"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    size: Mapped[str] = mapped_column(String(10), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False)
    color_hex: Mapped[str | None] = mapped_column(String(7), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    price_override: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    product: Mapped["Product"] = relationship("Product", back_populates="variants")
    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="variant")
    cart_items: Mapped[list["CartItem"]] = relationship("CartItem", back_populates="variant")
