from pydantic import BaseModel

class Progress(BaseModel):
    user_id: str
    lesson_id: str
    course_id: str
    completed: bool

class ProgressUpdate(BaseModel):
    lesson_id: str
    course_id: str
    completed: bool = True