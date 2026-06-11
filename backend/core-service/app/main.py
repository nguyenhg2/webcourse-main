from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .api.routes import auth, courses, categories, sections, lessons, enrollment, roadmaps, reviews, progress, cart, admin, checkout, site_content
from .db.mongo import ensure_indexes
from .subscribers.payment_subscriber import start_payment_success_listener, stop_payment_success_listener

app = FastAPI(title="CodeCamp Core Service")

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
app.include_router(site_content.router)


@app.on_event("startup")
async def startup_event():
    await ensure_indexes()
    await start_payment_success_listener()


@app.on_event("shutdown")
async def shutdown_event():
    await stop_payment_success_listener()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
