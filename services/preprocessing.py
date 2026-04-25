from datetime import datetime
from typing import Any

AMOUNT_SCALE_FACTOR = 1000.0


def _to_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value)
    raise ValueError("Invalid timestamp format.")


def _normalize_amount(value: Any) -> float:
    amount = float(value)
    return amount / AMOUNT_SCALE_FACTOR


def _safe_text(value: Any, default: str) -> str:
    if value is None:
        return default
    cleaned = str(value).strip()
    return cleaned or default


def preprocess_transaction_data(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "amount": _normalize_amount(payload.get("amount", 0.0)),
        "timestamp": _to_datetime(payload.get("timestamp")),
        "merchant": _safe_text(payload.get("merchant"), "unknown"),
        "category": _safe_text(payload.get("category"), "uncategorized"),
        "location": payload.get("location"),
        "isFraud": bool(payload.get("isFraud", False)),
    }
