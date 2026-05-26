from __future__ import annotations

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from models.user import User
from services.security import decode_token

bearer = HTTPBearer(auto_error=False)


async def _resolve_user(token: str, db: AsyncSession) -> User | None:
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        user_id = UUID(str(payload["sub"]))
    except (TypeError, ValueError):
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    user = await _resolve_user(credentials.credentials, db)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    user = await _resolve_user(credentials.credentials, db)
    if not user or not user.is_active:
        return None
    return user
