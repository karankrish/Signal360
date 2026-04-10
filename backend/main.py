import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import feedback, sentiment, trends, events, channels, personas, risks, insights, summary
from app.repositories.feedback_repo import feedback_repo
from app.services.ingestion import load_and_preprocess
from app.services import sentiment as sentiment_svc

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "data.json.txt")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-load Nike data on startup
    data_path = os.path.abspath(DATA_FILE)
    if os.path.exists(data_path):
        records = load_and_preprocess(data_path)
        records = sentiment_svc.analyze_batch(records)
        feedback_repo.load(records)
        print(f"[Signal360] Loaded {len(records)} records from {data_path}")
    else:
        print(f"[Signal360] Data file not found at {data_path}, starting empty.")
    yield


app = FastAPI(
    title="Signal360 API",
    description="AI-powered omni-channel customer intelligence platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(feedback.router, prefix="/api")
app.include_router(sentiment.router, prefix="/api")
app.include_router(trends.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(channels.router, prefix="/api")
app.include_router(personas.router, prefix="/api")
app.include_router(risks.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(summary.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Signal360 API is running", "docs": "/docs"}
