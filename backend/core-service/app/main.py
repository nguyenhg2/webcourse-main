from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .api.routes import auth, courses, categories, sections, lessons, enrollment, blogs, roadmaps, learning, reviews, progress, cart, admin

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
app.include_router(blogs.router)
app.include_router(roadmaps.router)
app.include_router(learning.router)
app.include_router(reviews.router)
app.include_router(progress.router)
app.include_router(cart.router)
app.include_router(admin.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
