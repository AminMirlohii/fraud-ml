from typing import Any

from services.features import transaction_to_features
from services.model import predict_fraud
from services.preprocessing import preprocess_transaction_data


def predict_transaction_fraud(payload: dict[str, Any]) -> dict[str, Any]:
    """
    End-to-end transaction scoring:
    preprocess raw payload -> build feature vector -> model + anomaly scoring.
    """
    processed = preprocess_transaction_data(payload)
    feature_vector = transaction_to_features(processed)
    scores = predict_fraud(feature_vector)

    return {
        "model_fraud_probability": float(scores["model_fraud_probability"]),
        "amount_z_score": float(scores["amount_z_score"]),
        "amount_anomaly_score": float(scores["amount_anomaly_score"]),
        "combined_score": float(scores["combined_score"]),
        "fraud_label": bool(scores["is_fraud"]),
        "explanations": list(scores["explanations"]),
    }
