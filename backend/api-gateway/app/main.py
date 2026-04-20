import uvicorn
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .proxy_routes import router as proxy_router
# from .logger import setup_logger
# from .rate_limiter import limiter

# setup_logger()

app=FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.middleware("http")
# async def gateway_middleware(request: Request, call_next):
#     await limiter.check_rate_limit(request)
#     logging.info(f"Incoming request: {request.method} {request.url.path}")
#     response = await call_next(request)
#     logging.info(f"Response status: {response.status_code}")
#     return response

app.include_router(proxy_router)

if __name__=="__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
