from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.admin import get_current_admin
from models.coupon import Coupon
from schemas.coupon import CouponCreate, CouponOut, CouponUpdate

router = APIRouter(prefix="/api/admin/coupons", tags=["Admin Coupons"])


@router.get("", response_model=list[CouponOut])
async def list_coupons(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Coupon).order_by(Coupon.expires_at.desc()).offset((page - 1) * limit).limit(limit))
    return result.scalars().all()


@router.post("", response_model=CouponOut, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    payload: CouponCreate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    code = payload.code.upper()
    existing_result = await db.execute(select(Coupon).where(Coupon.code == code))
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon code already exists")

    coupon = Coupon(**payload.model_dump(), code=code)
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponOut)
async def update_coupon(
    coupon_id: UUID,
    payload: CouponUpdate,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "code" and isinstance(value, str):
            setattr(coupon, field, value.upper())
        else:
            setattr(coupon, field, value)

    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}")
async def delete_coupon(
    coupon_id: UUID,
    _: object = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")

    await db.delete(coupon)
    await db.commit()
    return {"message": "Coupon deleted"}
