from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn
from redis.asyncio import Redis
from .controllers import (
    AdminController as admin_controller,
    AuthController as auth_controller,
    CartController as cart_controller,
    CategoryController as category_controller,
    CheckoutController as checkout_controller,
    ComplaintController as complaint_controller,
    CourseController as course_controller,
    EnrollmentController as enrollment_controller,
    LessonController as lesson_controller,
    ProgressController as progress_controller,
    ReviewController as review_controller,
    RoadmapController as roadmap_controller,
    SectionController as section_controller,
    SiteContentController as site_content_controller,
)
from .core.config import settings
from .db.mongo import ensure_indexes
from .subscribers.payment_subscriber import start_payment_success_listener, stop_payment_success_listener

app = FastAPI(title="CodeCamp Core Service")
logger = logging.getLogger(__name__)
controllers = [
    auth_controller,
    course_controller,
    category_controller,
    section_controller,
    lesson_controller,
    enrollment_controller,
    roadmap_controller,
    review_controller,
    progress_controller,
    cart_controller,
    admin_controller,
    checkout_controller,
    complaint_controller,
    site_content_controller,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for controller in controllers:
    app.include_router(controller.router)


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
