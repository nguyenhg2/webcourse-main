from pydantic import BaseModel, Field

class Enrollment:
    user_id: str
    course_id: str
    payment_id: str

class EnrollRequest(BaseModel):
    course_id: str | None = None
    course_ids: list[str] | None = None
    payment_id: str | None = None


class PaymentSuccessEvent(BaseModel):
    user_id: str
    course_ids: list[str] = Field(default_factory=list)
    payment_id: str