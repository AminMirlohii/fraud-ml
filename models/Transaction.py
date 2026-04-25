from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String

from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    merchant = Column(String(255), nullable=False)
    category = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    isFraud = Column(Boolean, default=False, nullable=False)
