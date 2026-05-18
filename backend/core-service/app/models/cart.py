from pydantic import BaseModel

class Cart(BaseModel):
    user_id: str
    items: list[str] 

class CartItemRequest(BaseModel):
    course_id: str