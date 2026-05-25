from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from database.db import get_db
from models.product import Product
from schemas.product import ProductOut

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    sort: str = Query(default="newest"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_active.is_(True))

    if search:
        query = query.filter(Product.name.ilike(f"%{search.strip()}%"))
    if category:
        query = query.filter(Product.category.ilike(category.strip()))

    sort_key = sort.lower()
    if sort_key == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_key == "price_desc":
        query = query.order_by(desc(Product.price))
    else:
        query = query.order_by(desc(Product.created_at))

    return query.offset(skip).limit(limit).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active.is_(True)).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
