from pydantic import BaseModel


class LessonCommentCreate(BaseModel):
    content: str


class LessonNoteCreate(BaseModel):
    content: str
    timestamp: int = 0
