from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from schemas.auth import User

import os

SECRET_KEY = os.getenv("JWT_SECRET", "aetherops-secret-key-for-mvp")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

# Mock users
USERS_DB = {
    "admin@aetherops.io": {
        "email": "admin@aetherops.io",
        "password_hash": "$2b$12$6mTqCMLovAUwiJi9kyp6NuGGyi0tW7tbY5V56JdsTg0ljxNCMyzrG", # "admin123"
        "role": "admin"
    },
    "viewer@aetherops.io": {
        "email": "viewer@aetherops.io",
        "password_hash": "$2b$12$6mTqCMLovAUwiJi9kyp6NuGGyi0tW7tbY5V56JdsTg0ljxNCMyzrG", # "admin123"
        "role": "viewer"
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_data = USERS_DB.get(email)
    if user_data is None:
        raise credentials_exception
    
    return User(email=user_data["email"], role=user_data["role"])
