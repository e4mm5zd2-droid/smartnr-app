"""アクセスログ用Pydanticスキーマ"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AccessLogCreate(BaseModel):
    user_id: Optional[str] = None
    user_email: str = ""
    user_role: str = "unknown"
    request_method: str
    request_path: str
    request_query: str = ""
    request_body_summary: str = ""
    ip_address: str = ""
    user_agent: str = ""
    referer: str = ""
    response_status: int = 0
    response_time_ms: int = 0
    error_message: str = ""
    action_type: str = "view"
    resource_type: str = ""
    resource_id: str = ""
    session_id: str = ""


class AccessLogResponse(BaseModel):
    id: int
    user_id: Optional[str]
    user_email: str
    user_role: str
    request_method: str
    request_path: str
    request_query: str
    ip_address: str
    user_agent: str
    response_status: int
    response_time_ms: int
    error_message: str
    action_type: str
    resource_type: str
    resource_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class AccessLogFilter(BaseModel):
    """ログ検索フィルター"""
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    action_type: Optional[str] = None
    resource_type: Optional[str] = None
    response_status_min: Optional[int] = None
    response_status_max: Optional[int] = None
    ip_address: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search: Optional[str] = None
    page: int = 1
    per_page: int = 50


class AccessLogStats(BaseModel):
    """ログ統計"""
    log_date: str
    total_requests: int
    unique_users: int
    unique_ips: int
    login_count: int
    error_count: int
    create_count: int
    update_count: int
    delete_count: int
    export_count: int
    avg_response_time_ms: int
