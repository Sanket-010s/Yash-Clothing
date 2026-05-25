import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from schemas.order import CreateOrderRequest, OrderOut
from services.dependencies import get_current_user, get_optional_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart cannot be empty")

    subtotal = 0.0
    order_items: list[OrderItem] = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.is_active.is_(True)).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}",
            )

        unit_price = float(product.price)
        subtotal += unit_price * item.quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                size=item.size,
                color=item.color,
            )
        )
        product.stock -= item.quantity

    gst_amount = round(subtotal * 0.12, 2)
    delivery_amount = 0 if subtotal >= 999 else 49
    discount_amount = 0
    total_amount = round(subtotal + gst_amount + delivery_amount - discount_amount, 2)

    order = Order(
        user_id=current_user.id if current_user else None,
        subtotal=round(subtotal, 2),
        gst_amount=gst_amount,
        delivery_amount=delivery_amount,
        discount_amount=discount_amount,
        total_amount=total_amount,
        address_snapshot=json.dumps(payload.address.model_dump()),
        items=order_items,
    )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def list_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders
