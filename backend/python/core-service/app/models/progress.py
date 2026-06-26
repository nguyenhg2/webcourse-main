from typing import Optional
from pydantic import BaseModel

class Progress(BaseModel):
    user_id: str
    lesson_id: str
    course_id: str
    completed: bool
    completed_at: str

class ProgressUpdate(BaseModel):
    lesson_id: str
    course_id: str
    completed: bool = True
    completed_at: Optional[str] = None
    watched_seconds: Optional[float] = None
    video_duration: Optional[float] = None
    watched_percent: Optional[float] = None
    playback_rate: Optional[float] = None
