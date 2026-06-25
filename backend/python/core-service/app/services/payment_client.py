import httpx
from fastapi import HTTPException, Request

from app.core.config import settings


def _auth_header(request: Request | None = None, authorization: str | None = None) -> str:
    if authorization is not None:
        return authorization
    if request is None:
        return ""
    return request.headers.get("authorization", "")


def _headers(request: Request | None = None, authorization: str | None = None) -> dict:
    headers = {
        "X-Internal-Token": settings.payment_internal_token,
    }
    auth = _auth_header(request, authorization)
    if auth:
        headers["Authorization"] = auth
    return headers


def normalize_payment(payment: dict | None) -> dict | None:
    if not payment:
        return payment
    if "_id" not in payment and "id" in payment:
        payment["_id"] = payment["id"]
    if "final_amount" not in payment:
        amount = int(payment.get("amount", 0) or 0)
        discount = int(payment.get("coupon_discount", 0) or payment.get("discount_amount", 0) or 0)
        payment["final_amount"] = max(amount - discount, 0)
    return payment


async def payment_request(
    method: str,
    path: str,
    *,
    request: Request | None = None,
    authorization: str | None = None,
    json: dict | None = None,
) -> dict:
    url = settings.payment_service_url.rstrip("/") + path
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.request(
                method,
                url,
                json=json,
                headers=_headers(request, authorization),
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Payment service is unavailable") from exc

    if response.status_code >= 400:
        try:
            data = response.json()
            detail = data.get("error") or data.get("detail") or response.text
        except ValueError:
            detail = response.text
        raise HTTPException(status_code=response.status_code, detail=detail)

    if not response.content:
        return {}
    return response.json()


async def list_payments(request: Request | None = None, authorization: str | None = None) -> list[dict]:
    data = await payment_request("GET", "/api/payments", request=request, authorization=authorization)
    payments = data if isinstance(data, list) else data.get("payments", [])
    return [normalize_payment(payment) for payment in payments]


async def get_payment(
    payment_id: str,
    request: Request | None = None,
    authorization: str | None = None,
) -> dict | None:
    payment = await payment_request(
        "GET",
        f"/api/payments/{payment_id}",
        request=request,
        authorization=authorization,
    )
    return normalize_payment(payment)


async def list_my_payments(request: Request | None = None, authorization: str | None = None) -> list[dict]:
    data = await payment_request("GET", "/api/payments/history", request=request, authorization=authorization)
    payments = data if isinstance(data, list) else data.get("payments", [])
    return [normalize_payment(payment) for payment in payments]


async def create_payment(payload: dict, request: Request) -> dict:
    return await payment_request("POST", "/api/payments", request=request, json=payload)


async def sync_payment(payment_id: str, request: Request) -> dict:
    return await payment_request("POST", f"/api/payments/{payment_id}/sync", request=request, json={})
