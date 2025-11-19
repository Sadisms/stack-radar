from typing import Any


def build_search_condition(query: str, fields: list[str]) -> tuple[str, list[str]]:
    """
    Build SQL search condition for multiple fields
    
    Args:
        query: Search query string
        fields: List of field names to search in
        
    Returns:
        Tuple of (SQL condition, parameters list)
    """
    if not query or not fields:
        return "TRUE", []
    
    conditions = []
    params = []
    param_index = 1
    
    for field in fields:
        conditions.append(f"{field} ILIKE ${param_index}")
        params.append(f"%{query}%")
        param_index += 1
    
    sql = f"({' OR '.join(conditions)})"
    return sql, params


def validate_sort_field(field: str, allowed_fields: dict[str, str], default: str = "id") -> str:
    """
    Validate and map sort field to SQL column name
    
    Args:
        field: Field name from request
        allowed_fields: Dictionary mapping field names to SQL columns
        default: Default field name
        
    Returns:
        SQL column name
    """
    if field in allowed_fields:
        return allowed_fields[field]
    return allowed_fields.get(default, default)


def format_datetime(dt: Any) -> str | None:
    """
    Format datetime object to ISO string
    
    Args:
        dt: Datetime object
        
    Returns:
        ISO formatted string or None
    """
    if dt is None:
        return None
    if hasattr(dt, "isoformat"):
        return dt.isoformat()
    return str(dt)

