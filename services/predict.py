from typing import Any

from services.features import transaction_to_features
from services.model import predict_fraud
from services.preprocessing import preprocess_transaction_data


def predict_transaction_fraud(payload: dict[str, Any]) -> dict[str, float | bool]:
    """
    End-to-end transaction scoring:
    preprocess raw payload -> build feature vector -> run model prediction.
    """
    processed = preprocess_transaction_data(payload)
    feature_vector = transaction_to_features(processed)
    prediction = predict_fraud(feature_vector)

    return {
        "fraud_probability": float(prediction["fraud_probability"]),
        "fraud_label": bool(prediction["is_fraud"]),
    }
