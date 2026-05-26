from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    guest_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    guest_phone: Mapped[str | None] = mapped_column(String(15), nullable=True)
    address_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("addresses.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    gst_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    delivery_charge: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    coupon_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User | None"] = relationship("User", back_populates="orders")
    address: Mapped["Address"] = relationship("Address", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment: Mapped["Payment | None"] = relationship("Payment", back_populates="order", uselist=False)
    invoice: Mapped["Invoice | None"] = relationship("Invoice", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False, index=True)
    product_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    variant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("variants.id"), nullable=False)
    design_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("custom_designs.id"), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    size: Mapped[str] = mapped_column(String(10), nullable=False)
    color: Mapped[str] = mapped_column(String(50), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product | None"] = relationship("Product", back_populates="order_items")
    variant: Mapped["Variant"] = relationship("Variant", back_populates="order_items")
    design: Mapped["CustomDesign | None"] = relationship("CustomDesign", back_populates="order_items")
