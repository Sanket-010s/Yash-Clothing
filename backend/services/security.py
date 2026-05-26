from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12, deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, role: str = "user") -> str:
    now = datetime.now(timezone.utc)
    expires_at = (
        now + timedelta(hours=settings.ADMIN_TOKEN_EXPIRE_HOURS)
        if role == "admin"
        else now + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    )
    payload = {"sub": subject, "role": role, "iat": now, "exp": expires_at}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
