from __future__ import annotations

from typing import Iterable

import numpy as np
from sklearn.linear_model import LogisticRegression

# Matches the vector layout from services.features.transaction_to_features:
# [normalized_amount, hour_of_day, is_high_amount, 6 category one-hot flags]
FEATURE_SIZE = 9


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


def _train_model() -> LogisticRegression:
    x_train, y_train = _build_synthetic_dataset()
    clf = LogisticRegression(max_iter=500, random_state=42)
    clf.fit(x_train, y_train)
    return clf


trained_model = _train_model()


def predict_fraud(feature_vector: Iterable[float]) -> dict[str, float | int]:
    features = np.asarray(list(feature_vector), dtype=float)
    if features.shape[0] != FEATURE_SIZE:
        raise ValueError(f"Expected {FEATURE_SIZE} features, got {features.shape[0]}.")

    features = features.reshape(1, -1)
    fraud_probability = float(trained_model.predict_proba(features)[0][1])
    fraud_label = int(trained_model.predict(features)[0])
    return {"is_fraud": fraud_label, "fraud_probability": fraud_probability}
