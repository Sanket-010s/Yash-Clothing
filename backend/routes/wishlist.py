from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.db import get_db
from middleware.auth import get_current_user
from models.product import Product
from models.user import User
from models.wishlist import Wishlist
from schemas.wishlist import WishlistOut

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


@router.get("", response_model=list[WishlistOut])
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product).selectinload(Product.variants))
        .where(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{product_id}", response_model=WishlistOut, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == product_id, Product.is_active.is_(True)))
    if not product_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing_result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        return existing

    entry = Wishlist(user_id=current_user.id, product_id=product_id)
    db.add(entry)
    await db.commit()

    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product).selectinload(Product.variants))
        .where(Wishlist.id == entry.id)
    )
    return result.scalar_one()


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id, Wishlist.product_id == product_id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist entry not found")

    await db.delete(entry)
    await db.commit()
    return {"message": "Removed from wishlist"}
