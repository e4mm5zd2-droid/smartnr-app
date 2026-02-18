"""管理者向けアクセスログAPI"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import datetime, timedelta
from app.core.database import get_supabase
from supabase import Client

router = APIRouter(prefix="/api/admin/access-logs", tags=["AccessLogs"])


def require_admin(supabase: Client = Depends(get_supabase)):
    """管理者権限チェック（簡易版。本番ではJWT検証を追加）"""
    # TODO: Supabase Auth JWTからroleを検証
    return supabase


@router.get("")
async def get_access_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    user_email: Optional[str] = None,
    action_type: Optional[str] = None,
    resource_type: Optional[str] = None,
    ip_address: Optional[str] = None,
    status_min: Optional[int] = None,
    status_max: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    supabase: Client = Depends(require_admin),
):
    """アクセスログ一覧取得（ページネーション＋フィルター）"""
    query = supabase.table("admin_access_logs").select("*", count="exact")

    # フィルター適用
    if user_email:
        query = query.ilike("user_email", f"%{user_email}%")
    if action_type:
        query = query.eq("action_type", action_type)
    if resource_type:
        query = query.eq("resource_type", resource_type)
    if ip_address:
        query = query.ilike("ip_address", f"%{ip_address}%")
    if status_min:
        query = query.gte("response_status", status_min)
    if status_max:
        query = query.lte("response_status", status_max)
    if date_from:
        query = query.gte("created_at", date_from)
    if date_to:
        query = query.lte("created_at", date_to)
    if search:
        query = query.or_(
            f"request_path.ilike.%{search}%,"
            f"user_email.ilike.%{search}%,"
            f"ip_address.ilike.%{search}%,"
            f"error_message.ilike.%{search}%"
        )

    # ページネーション
    offset = (page - 1) * per_page
    query = query.order("created_at", desc=True).range(offset, offset + per_page - 1)

    result = query.execute()

    return {
        "data": result.data,
        "total": result.count,
        "page": page,
        "per_page": per_page,
        "total_pages": (result.count + per_page - 1) // per_page if result.count else 0,
    }


@router.get("/stats")
async def get_access_log_stats(
    days: int = Query(30, ge=1, le=90),
    supabase: Client = Depends(require_admin),
):
    """日別アクセス統計"""
    result = (
        supabase.table("access_log_daily_summary")
        .select("*")
        .gte("log_date", (datetime.utcnow() - timedelta(days=days)).isoformat())
        .order("log_date", desc=True)
        .execute()
    )
    return {"data": result.data, "period_days": days}


@router.get("/realtime")
async def get_realtime_logs(
    limit: int = Query(20, ge=1, le=100),
    supabase: Client = Depends(require_admin),
):
    """直近のリアルタイムログ（ダッシュボード用）"""
    result = (
        supabase.table("admin_access_logs")
        .select("id, user_email, request_method, request_path, response_status, response_time_ms, ip_address, action_type, created_at")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"data": result.data}


@router.get("/suspicious")
async def get_suspicious_activity(
    supabase: Client = Depends(require_admin),
):
    """不審なアクティビティ検出"""
    one_hour_ago = (datetime.utcnow() - timedelta(hours=1)).isoformat()

    # 直近1時間で401/403が多いIP
    auth_failures = (
        supabase.table("admin_access_logs")
        .select("ip_address, count")
        .gte("created_at", one_hour_ago)
        .in_("response_status", [401, 403])
        .execute()
    )

    # 直近1時間でDELETE操作が多いユーザー
    delete_heavy = (
        supabase.table("admin_access_logs")
        .select("user_email, request_path, created_at")
        .gte("created_at", one_hour_ago)
        .eq("request_method", "DELETE")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return {
        "auth_failures": auth_failures.data,
        "delete_operations": delete_heavy.data,
    }
