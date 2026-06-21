from pydantic import BaseModel
from app.models.common import Role

class UserRoleUpdate(BaseModel):
    role: Role

class UserStatusUpdate(BaseModel):
    is_active: bool
