from math import ceil
from typing import Any


def paginate(
    items: list[Any],
    page: int,
    limit: int,
):
    total = len(items)

    start = (page - 1) * limit
    end = start + limit

    return {
        "items": items[start:end],
        "pagination": {
            "page": page,
            "limit": limit,
            "total_items": total,
            "total_pages": ceil(total / limit) if total else 1,
            "has_next": end < total,
            "has_previous": page > 1,
        },
    }