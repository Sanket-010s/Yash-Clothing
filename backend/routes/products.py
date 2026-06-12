from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from cachetools import TTLCache
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from middleware.admin import get_current_admin
from models.product import Product, Variant
from schemas.product import ProductCreate, ProductListOut, ProductOut, ProductUpdate, VariantCreate, VariantOut, VariantUpdate

router = APIRouter(prefix="/api/products", tags=["Products"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Products"])

products_cache: TTLCache = TTLCache(maxsize=50, ttl=300)


@router.get("", response_model=list[ProductListOut])
async def list_products(
    category: str | None = None,
    size: str | None = None,
    color: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    sort: str = Query(default="newest"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    cache_key = (category, size, color, min_price, max_price, sort, page, limit)
    if cache_key in products_cache:
        return products_cache[cache_key]
    query: Select[tuple[Product]] = select(Product).options(selectinload(Product.variants)).where(Product.is_active.is_(True))

    if category:
        query = query.where(Product.category.ilike(category.strip()))
    if size or color:
        query = query.join(Variant)
        if size:
            query = query.where(Variant.size.ilike(size.strip()))
        if color:
            query = query.where(or_(Variant.color.ilike(color.strip()), Variant.color_hex.ilike(color.strip())))
    if min_price is not None:
        query = query.where(func.coalesce(Product.sale_price, Product.base_price) >= min_price)
    if max_price is not None:
        query = query.where(func.coalesce(Product.sale_price, Product.base_price) <= max_price)

    effective_price = func.coalesce(Product.sale_price, Product.base_price)
    sort_value = sort.lower()
    if sort_value == "price_asc":
        query = query.order_by(asc(effective_price))
    elif sort_value == "price_desc":
        query = query.order_by(desc(effective_price))
    else:
        query = query.order_by(desc(Product.created_at))

    query = query.distinct().offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    products = [ProductListOut.from_product(p) for p in result.scalars().all()]
    products_cache[cache_key] = products
    return products


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.variants)).where(Product.id == product_id, Product.is_active.is_(True))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@admin_router.get("/products", response_model=list[ProductOut])
async def admin_list_products(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).options(selectinload(Product.variants)).order_by(desc(Product.created_at)).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@admin_router.get("/products/{product_id}", response_model=ProductOut)
async def admin_get_product(
    product_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@admin_router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    product = Product(**payload.model_dump())
    db.add(product)
    await db.commit()
    products_cache.clear()
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product.id))
    return result.scalar_one()


@admin_router.put("/products/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: UUID,
    payload: ProductUpdate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    products_cache.clear()
    # Fetch the updated product with all relationships
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product_id))
    return result.scalar_one()


@admin_router.delete("/products/{product_id}")
async def delete_product(
    product_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from models.order import OrderItem
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Check if product has any order items
    order_items_result = await db.execute(select(OrderItem).where(OrderItem.product_id == product_id).limit(1))
    if order_items_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product that has been ordered. Consider deactivating it instead."
        )

    await db.delete(product)
    await db.commit()
    products_cache.clear()
    return {"message": "Product deleted"}


@admin_router.post("/products/{product_id}/variants", response_model=VariantOut, status_code=status.HTTP_201_CREATED)
async def add_variant(
    product_id: UUID,
    payload: VariantCreate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    if not product_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing_result = await db.execute(
        select(Variant).where(Variant.product_id == product_id, Variant.size == payload.size, Variant.color == payload.color)
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Variant already exists")

    variant = Variant(product_id=product_id, **payload.model_dump())
    db.add(variant)
    await db.commit()
    await db.refresh(variant)
    return variant


@admin_router.put("/variants/{variant_id}", response_model=VariantOut)
async def update_variant(
    variant_id: UUID,
    payload: VariantUpdate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Variant).where(Variant.id == variant_id))
    variant = result.scalar_one_or_none()
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(variant, field, value)

    await db.commit()
    await db.refresh(variant)
    return variant
