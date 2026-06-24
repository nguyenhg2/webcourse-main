from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn
from redis.asyncio import Redis
from .api.routes import auth, courses, categories, sections, lessons, enrollment, roadmaps, reviews, progress, cart, admin, checkout, complaints, site_content
from .core.config import settings
from .db.mongo import ensure_indexes
from .subscribers.payment_subscriber import start_payment_success_listener, stop_payment_success_listener

app = FastAPI(title="CodeCamp Core Service")
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(categories.router)
app.include_router(sections.router)
app.include_router(lessons.router)
app.include_router(enrollment.router)
app.include_router(roadmaps.router)
app.include_router(reviews.router)
app.include_router(progress.router)
app.include_router(cart.router)
app.include_router(admin.router)
app.include_router(checkout.router)
app.include_router(complaints.router)
app.include_router(site_content.router)


@app.get("/health")
async def health():
    return {"service": "core", "status": "ok"}


async def _ensure_indexes_without_blocking_startup():
    redis = None
    try:
        if settings.redis_url:
            redis = Redis.from_url(settings.redis_url, decode_responses=True)
            lock_acquired = await redis.set("core:startup:ensure-indexes", "1", nx=True, ex=300)
            if not lock_acquired:
                logger.info("Skipping index bootstrap because another worker holds the lock")
                return

        await ensure_indexes()
    except Exception as exc:
        logger.warning("Cannot ensure Mongo indexes during startup: %s", exc)
    finally:
        if redis:
            await redis.close()


@app.on_event("startup")
async def startup_event():
    await _ensure_indexes_without_blocking_startup()
    await start_payment_success_listener()


@app.on_event("shutdown")
async def shutdown_event():
    await stop_payment_success_listener()

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8001)
