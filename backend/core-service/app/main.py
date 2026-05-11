from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from .api.routes import auth, courses, categories, sections, lessons, enrollment, blogs, roadmaps, learning

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
