from datetime import datetime
from typing import Any, Mapping, Sequence

HIGH_AMOUNT_THRESHOLD = 100.0

CATEGORIES: Sequence[str] = (
    "shopping",
    "food",
    "travel",
    "bills",
    "entertainment",
    "uncategorized",
)


def _get(obj: Any, key: str) -> Any:
    if isinstance(obj, Mapping):
        return obj.get(key)
    return getattr(obj, key, None)


def _as_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    raise ValueError("timestamp must be datetime or ISO string")


def _category_one_hot(category: str | None) -> list[float]:
    key = (category or "").strip().lower()
    if key not in CATEGORIES:
        key = "uncategorized"
    return [1.0 if c == key else 0.0 for c in CATEGORIES]


def transaction_to_features(transaction: Any) -> list[float]:
    """
    Map a transaction (dict, mapping, or ORM row) to a flat numeric feature vector.

    Order: [normalized_amount, hour_of_day, is_high_amount, ...category_one_hot]
    """
    amount = float(_get(transaction, "amount"))
    ts = _as_datetime(_get(transaction, "timestamp"))
    category = _get(transaction, "category")

    hour = float(ts.hour)
    is_high = 1.0 if amount > HIGH_AMOUNT_THRESHOLD else 0.0

    return [amount, hour, is_high, *_category_one_hot(category)]
