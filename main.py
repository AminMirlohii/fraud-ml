from fastapi import FastAPI
from sqlalchemy import inspect

from database import Base, engine
from models import Transaction

app = FastAPI()


@app.on_event("startup")
def create_tables() -> None:
    inspector = inspect(engine)
    if not inspector.has_table(Transaction.__tablename__):
        Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return "API is running"
