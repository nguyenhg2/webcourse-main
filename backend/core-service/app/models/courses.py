from pydantic import BaseModel, Field
from typing import Optional
from app.models.common import Level

class CourseBase(BaseModel):
    title: str
    slug: Optional[str] = None
    description: str
    thumbnail: Optional[str] = None
    price: float = 0.0
    category_id: str
    instructor_id: str
    level: Level
    rating: float = 0.0
    total_students: int = 0
    status: str = "draft"
    create_at: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[str] = None
    instructor_id: Optional[str] = None
    level: Optional[Level] = None
    total_students: Optional[int] = None
    status: Optional[str] = None
    create_at: Optional[str] = None

class CourseResponse(CourseBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True