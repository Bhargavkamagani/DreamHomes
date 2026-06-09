from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.settings import settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_context.verify(password, hashed_password)


def create_access_token(user_id: int) -> str:
    expire_at = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode({"sub": str(user_id), "type": "access", "exp": expire_at}, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: int) -> str:
    expire_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days)
    return jwt.encode({"sub": str(user_id), "type": "refresh", "exp": expire_at}, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def read_token_user_id(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        return None
