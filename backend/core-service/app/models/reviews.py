from pydantic import BaseModel, Field

class Review(BaseModel):
    user_id: str
    course_id: str
    rating: float = Field(ge=1, le=5)
    comment: str
    created_at: str