from pydantic import BaseModel

class Section(BaseModel):
    course_id: str
    title: str
    order: int

class UpdateSection(BaseModel):
    title: str
    order: int