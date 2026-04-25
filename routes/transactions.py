from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models import Transaction
from services import preprocess_transaction_data

router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
    amount: float
    timestamp: datetime
    merchant: str
    category: str
    location: Optional[str] = None
    isFraud: bool = False


class TransactionResponse(TransactionCreate):
    id: int

    class Config:
        from_attributes = True


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    try:
        processed_payload = preprocess_transaction_data(payload.model_dump())
        transaction = Transaction(**processed_payload)
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save transaction.",
        ) from exc


@router.get("", response_model=list[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    try:
        return db.query(Transaction).all()
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch transactions.",
        ) from exc
