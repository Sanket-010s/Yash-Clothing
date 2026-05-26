from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth import get_current_user
from models.design import CustomDesign
from models.user import User
from schemas.design import DesignCreate, DesignOut

router = APIRouter(prefix="/api/designs", tags=["Designs"])


@router.post("", response_model=DesignOut, status_code=status.HTTP_201_CREATED)
async def create_design(
    payload: DesignCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    design = CustomDesign(user_id=current_user.id, **payload.model_dump())
    db.add(design)
    await db.commit()
    await db.refresh(design)
    return design


@router.get("", response_model=list[DesignOut])
async def list_designs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomDesign).where(CustomDesign.user_id == current_user.id).order_by(CustomDesign.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/{design_id}")
async def delete_design(
    design_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomDesign).where(CustomDesign.id == design_id, CustomDesign.user_id == current_user.id)
    )
    design = result.scalar_one_or_none()
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

    await db.delete(design)
    await db.commit()
    return {"message": "Design deleted"}
