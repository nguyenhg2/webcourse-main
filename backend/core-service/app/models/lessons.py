from pydantic import BaseModel
from typing import Optional

class Lesson(BaseModel):
    section_id: str
    course_id: str
    title: str
    video_url: str
    video_public_id: Optional[str] = None
    video_asset_folder: Optional[str] = None
    video_delivery_type: Optional[str] = None
    video_format: Optional[str] = None
    video_version: Optional[int] = None
    content: Optional[str] = None
    quiz: Optional[list] = None
    duration: int
    is_free_preview: bool
    attachments: Optional[list] = None
    order: int

class UpdateLesson(BaseModel):
    title: Optional[str] = None
    video_url: Optional[str] = None
    video_public_id: Optional[str] = None
    video_asset_folder: Optional[str] = None
    video_delivery_type: Optional[str] = None
    video_format: Optional[str] = None
    video_version: Optional[int] = None
    content: Optional[str] = None
    quiz: Optional[list] = None
    duration: Optional[int] = None
    is_free_preview: Optional[bool] = None
    attachments: Optional[list] = None
    order: Optional[int] = None
