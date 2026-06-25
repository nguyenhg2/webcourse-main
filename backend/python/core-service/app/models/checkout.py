from pydantic import BaseModel

class CheckoutRequest(BaseModel):
    course_ids: list[str]
    coupon_code: str | None = None
    card_last4: str | None = None
    card_brand: str | None = None
    billing_address: dict | None = None