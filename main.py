from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from database import Base, engine
from models import Transaction
from routes import predict_router, transactions_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(transactions_router)
app.include_router(predict_router)


@app.on_event("startup")
def create_tables() -> None:
    inspector = inspect(engine)
    if not inspector.has_table(Transaction.__tablename__):
        Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return "API is running"
