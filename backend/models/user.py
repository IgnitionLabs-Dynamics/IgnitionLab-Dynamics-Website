from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import uuid
from datetime import datetime, timezone

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    hashed_password: str
    role: str = "admin"  # admin, technician
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserLogin(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "technician"

class RoleUpdate(BaseModel):
    role: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    role: str
    created_at: str
