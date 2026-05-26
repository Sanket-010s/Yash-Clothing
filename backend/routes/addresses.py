from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth import get_current_user
from models.address import Address
from models.user import User
from schemas.address import AddressCreate, AddressOut, AddressUpdate

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("", response_model=list[AddressOut])
async def list_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.id).order_by(Address.is_default.desc())
    )
    return result.scalars().all()


@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
async def create_address(
    payload: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.is_default:
        await db.execute(update(Address).where(Address.user_id == current_user.id).values(is_default=False))

    address = Address(user_id=current_user.id, **payload.model_dump())
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


@router.put("/{address_id}", response_model=AddressOut)
async def update_address(
    address_id: UUID,
    payload: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Address).where(Address.id == address_id, Address.user_id == current_user.id))
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("is_default") is True:
        await db.execute(update(Address).where(Address.user_id == current_user.id).values(is_default=False))

    for field, value in update_data.items():
        setattr(address, field, value)

    await db.commit()
    await db.refresh(address)
    return address


@router.delete("/{address_id}")
async def delete_address(
    address_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Address).where(Address.id == address_id, Address.user_id == current_user.id))
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    await db.delete(address)
    await db.commit()
    return {"message": "Address deleted"}


@router.put("/{address_id}/default")
async def set_default_address(
    address_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Address).where(Address.id == address_id, Address.user_id == current_user.id))
    address = result.scalar_one_or_none()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")

    await db.execute(update(Address).where(Address.user_id == current_user.id).values(is_default=False))
    address.is_default = True
    await db.commit()
    return {"message": "Default address updated", "address_id": str(address.id)}
