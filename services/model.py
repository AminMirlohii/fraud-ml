from __future__ import annotations

from typing import Any, Iterable

import numpy as np
from sklearn.linear_model import LogisticRegression

# Matches the vector layout from services.features.transaction_to_features:
# [normalized_amount, hour_of_day, is_high_amount, 6 category one-hot flags]
FEATURE_SIZE = 9

LR_WEIGHT = 0.65
ANOMALY_WEIGHT = 0.35
FINAL_THRESHOLD = 0.5

# Z-score → [0, 1] anomaly score: ramp between |z|=2 and |z|=4
Z_ANOMALY_LOW = 2.0
Z_ANOMALY_HIGH = 4.0


def _build_synthetic_dataset(samples_per_class: int = 250) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed=42)

    normal_amount = rng.uniform(0.0, 120.0, samples_per_class)
    normal_hour = rng.uniform(7.0, 22.0, samples_per_class)
    normal_high = (normal_amount > 100.0).astype(float)
    normal_cat = np.eye(6)[rng.choice([0, 1, 3, 4, 5], size=samples_per_class)]

    suspicious_amount = rng.uniform(90.0, 400.0, samples_per_class)
    suspicious_hour = rng.uniform(0.0, 6.0, samples_per_class)
    suspicious_high = (suspicious_amount > 100.0).astype(float)
    suspicious_cat = np.eye(6)[rng.choice([2, 5], size=samples_per_class)]

    x_normal = np.column_stack([normal_amount, normal_hour, normal_high, normal_cat])
    x_suspicious = np.column_stack(
        [suspicious_amount, suspicious_hour, suspicious_high, suspicious_cat]
    )

    x = np.vstack([x_normal, x_suspicious])
    y = np.concatenate([np.zeros(samples_per_class), np.ones(samples_per_class)])
    return x, y


def _reference_amount_stats(x_train: np.ndarray, y_train: np.ndarray) -> tuple[float, float]:
    """Mean/std of normalized amount on non-fraud (label 0) rows for Z-score baseline."""
    normal_rows = y_train == 0
    amounts = x_train[normal_rows, 0]
    mean = float(amounts.mean())
    std = float(amounts.std())
    if std < 1e-9:
        std = 1e-9
    return mean, std


def _z_score(amount: float, mean: float, std: float) -> float:
    return (amount - mean) / std


def _z_to_anomaly_score(z: float) -> float:
    a = abs(z)
    if a <= Z_ANOMALY_LOW:
        return 0.0
    if a >= Z_ANOMALY_HIGH:
        return 1.0
    return (a - Z_ANOMALY_LOW) / (Z_ANOMALY_HIGH - Z_ANOMALY_LOW)


def _category_explanation(category: str | None) -> str | None:
    """Simple, explainable flag aligned with synthetic training (travel / uncategorized over-represented in fraud)."""
    if not category:
        return None
    key = str(category).strip().lower()
    if key in ("travel", "uncategorized"):
        return "Unusual category (elevated in the model training profile)"
    return None


def _build_explanations(
    z_score: float,
    lr_prob: float,
    anomaly_score: float,
    category: str | None = None,
) -> list[str]:
    explanations: list[str] = []
    az = abs(z_score)

    if az >= 3.0:
        explanations.append("High amount anomaly (Z-score far from typical amounts)")
    elif az >= Z_ANOMALY_LOW:
        explanations.append("Amount moderately unusual versus typical amounts")

    if lr_prob >= 0.6:
        explanations.append("Strong elevated fraud risk from logistic regression")
    elif lr_prob >= 0.45:
        explanations.append("Moderate fraud risk from logistic regression")

    if anomaly_score >= 0.5 and lr_prob < 0.45:
        explanations.append("Anomaly score elevated despite low model probability")

    cat_line = _category_explanation(category)
    if cat_line:
        explanations.append(cat_line)

    if not explanations:
        explanations.append("No strong anomaly or model risk signals")

    return explanations


_x_train, _y_train = _build_synthetic_dataset()
trained_model = LogisticRegression(max_iter=500, random_state=42)
trained_model.fit(_x_train, _y_train)
AMOUNT_REF_MEAN, AMOUNT_REF_STD = _reference_amount_stats(_x_train, _y_train)


def predict_fraud(
    feature_vector: Iterable[float],
    category: str | None = None,
) -> dict[str, Any]:
    """
    Logistic regression + Z-score amount anomaly, combined with simple weights.
    """
    features = np.asarray(list(feature_vector), dtype=float)
    if features.shape[0] != FEATURE_SIZE:
        raise ValueError(f"Expected {FEATURE_SIZE} features, got {features.shape[0]}.")

    amount = float(features[0])
    z_score = _z_score(amount, AMOUNT_REF_MEAN, AMOUNT_REF_STD)
    amount_anomaly_score = _z_to_anomaly_score(z_score)

    row = features.reshape(1, -1)
    model_fraud_probability = float(trained_model.predict_proba(row)[0][1])

    combined_score = (
        LR_WEIGHT * model_fraud_probability + ANOMALY_WEIGHT * amount_anomaly_score
    )
    final_fraud = combined_score >= FINAL_THRESHOLD

    explanations = _build_explanations(
        z_score,
        model_fraud_probability,
        amount_anomaly_score,
        category=category,
    )

    return {
        "model_fraud_probability": model_fraud_probability,
        "amount_z_score": z_score,
        "amount_anomaly_score": amount_anomaly_score,
        "combined_score": combined_score,
        "is_fraud": int(final_fraud),
        "explanations": explanations,
    }
