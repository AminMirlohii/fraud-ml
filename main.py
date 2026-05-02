from fastapi import FastAPI
from sqlalchemy import inspect

from database import Base, engine
from models import Transaction
from routes import predict_router, transactions_router

app = FastAPI()
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
