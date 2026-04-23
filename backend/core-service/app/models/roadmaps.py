from pydantic import BaseModel
from typing import List, Optional

class Roadmap(BaseModel):
    title: str
    description: Optional[str] = None
    course_ids: List[str] = []
    thumbnail: Optional[str] = None
    created_at: Optional[str] = None