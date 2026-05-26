from __future__ import annotations

from fastapi import Depends, HTTPException, status

from middleware.auth import get_current_user
from models.user import User


async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
