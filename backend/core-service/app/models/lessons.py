from pydantic import BaseModel
from typing import Optional

class Lesson(BaseModel):
    section_id: str
    course_id: str
    title: str
    video_url: str
    duration: int
    is_free_preview: bool

class UpdateLesson(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    duration: Optional[int] = None
    is_free_preview: Optional[bool] = None