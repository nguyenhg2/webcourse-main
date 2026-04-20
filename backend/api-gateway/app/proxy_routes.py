from fastapi import APIRouter, Request, HTTPException, Response
import httpx
import logging

router = APIRouter()

SERVICES = {
    "core": "http://localhost:8001",
    "payment": "http://localhost:8002",
    "video": "http://localhost:8003",
    "blog": "http://localhost:8004",
}

client = httpx.AsyncClient(timeout=10.0)

async def proxy_request(service_name: str, path: str, request: Request):
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Service không tồn tại")
    
    base_url = SERVICES[service_name].rstrip('/')
    clean_path = path.lstrip('/')
    target_url = f"{base_url}/{clean_path}"
    
    method = request.method
    params = request.query_params
    headers = dict(request.headers)
    headers.pop("host", None)
    body = await request.body()

    try:
        response = await client.request(
            method=method,
            url=target_url,
            params=params,
            headers=headers,
            content=body
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
        
    except httpx.RequestError as exc:
        logging.error(f"Lỗi kết nối đến {service_name}: {exc}")
        raise HTTPException(status_code=503, detail=f"Dịch vụ {service_name} tạm thời không khả dụng")


#CORE SERVICE PROXIES
@router.get("/core/{path:path}")
async def get_core_proxy(path: str, request: Request):
    return await proxy_request("core", path, request)

@router.post("/core/{path:path}")
async def post_core_proxy(path: str, request: Request):
    return await proxy_request("core", path, request)

@router.put("/core/{path:path}")
async def put_core_proxy(path: str, request: Request):
    return await proxy_request("core", path, request)

@router.delete("/core/{path:path}")
async def delete_core_proxy(path: str, request: Request):
    return await proxy_request("core", path, request)



#PAYMENT SERVICE PROXIES
@router.get("/payment/{path:path}")
async def get_payment_proxy(path: str, request: Request):
    return await proxy_request("payment", path, request)

@router.post("/payment/{path:path}")
async def post_payment_proxy(path: str, request: Request):
    return await proxy_request("payment", path, request)

@router.put("/payment/{path:path}")
async def put_payment_proxy(path: str, request: Request):
    return await proxy_request("payment", path, request)

@router.delete("/payment/{path:path}")
async def delete_payment_proxy(path: str, request: Request):
    return await proxy_request("payment", path, request)


#VIDEO SERVICE PROXIES
@router.get("/video/{path:path}")
async def get_video_proxy(path: str, request: Request):
    return await proxy_request("video", path, request)

@router.post("/video/{path:path}")
async def post_video_proxy(path: str, request: Request):
    return await proxy_request("video", path, request)

@router.put("/video/{path:path}")
async def put_video_proxy(path: str, request: Request):
    return await proxy_request("video", path, request)

@router.delete("/video/{path:path}")
async def delete_video_proxy(path: str, request: Request):
    return await proxy_request("video", path, request)

#BLOG SERVICE PROXIES
@router.get("/blog/{path:path}")
async def get_blog_proxy(path: str, request: Request):
    return await proxy_request("blog", path, request)

@router.post("/blog/{path:path}")
async def post_blog_proxy(path: str, request: Request):
    return await proxy_request("blog", path, request)

@router.put("/blog/{path:path}")
async def put_blog_proxy(path: str, request: Request):
    return await proxy_request("blog", path, request)

@router.delete("/blog/{path:path}")
async def delete_blog_proxy(path: str, request: Request):
    return await proxy_request("blog", path, request)