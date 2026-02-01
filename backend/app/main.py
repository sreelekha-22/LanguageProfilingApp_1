from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyze import router as analyze_router
from app.api.topic import router as topic_router

app = FastAPI(title="Language Profiling Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")
app.include_router(topic_router, prefix="/api")
