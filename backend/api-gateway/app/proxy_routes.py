import logging
import os

import httpx
from fastapi import APIRouter, HTTPException, Request, Response

router = APIRouter()

SERVICES = {
    "core": os.getenv("CORE_SERVICE_URL", "http://core:8001"),
    "payment": os.getenv("PAYMENT_SERVICE_URL", "http://payment:8002"),
    "media": os.getenv("MEDIA_SERVICE_URL", "http://media:8004"),
    "blog": os.getenv("BLOG_SERVICE_URL", "http://blog:8003"),
}

client = httpx.AsyncClient(timeout=float(os.getenv("PROXY_TIMEOUT_SECONDS", "60")))


async def proxy_request(service_name: str, path: str, request: Request):
    base_url = SERVICES.get(service_name)
    if not base_url:
        raise HTTPException(status_code=404, detail="Service does not exist")

    headers = dict(request.headers)
    headers.pop("host", None)
    target_url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"

    try:
        response = await client.request(
            method=request.method,
            url=target_url,
            params=request.query_params,
            headers=headers,
            content=await request.body(),
        )
    except httpx.RequestError as exc:
        logging.error("Cannot connect to %s service: %s", service_name, exc)
        raise HTTPException(status_code=503, detail=f"Service {service_name} is unavailable") from exc

    return Response(
        content=response.content,
        status_code=response.status_code,
        headers=dict(response.headers),
    )


@router.api_route(
    "/{service_name}/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def service_proxy(service_name: str, path: str, request: Request):
    return await proxy_request(service_name, path, request)
