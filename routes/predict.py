from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from routes.transactions import TransactionCreate
from services import predict_transaction_fraud

router = APIRouter(tags=["predict"])


class FraudPredictResponse(BaseModel):
    model_fraud_probability: float = Field(..., ge=0.0, le=1.0)
    amount_z_score: float
    amount_anomaly_score: float = Field(..., ge=0.0, le=1.0)
    combined_score: float = Field(..., ge=0.0, le=1.0)
    fraud_label: bool
    explanations: list[str]


@router.post("/predict", response_model=FraudPredictResponse)
def predict_fraud_endpoint(payload: TransactionCreate) -> FraudPredictResponse:
    try:
        result = predict_transaction_fraud(payload.model_dump())
        return FraudPredictResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Fraud prediction failed.",
        ) from exc
