"""
アクセスログ記録Middleware
全HTTPリクエストを自動的にadmin_access_logsテーブルに記録する。
"""
import time
import json
import re
from typing import Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from supabase import Client

# 個人情報マスクパターン
SENSITIVE_FIELDS = [
    "password", "token", "secret", "api_key", "phone", "line_id",
    "real_name", "email", "address", "credit_card"
]

# ログ不要パス（ヘルスチェック、静的ファイル等）
SKIP_PATHS = [
    "/health",
    "/docs",
    "/openapi.json",
    "/redoc",
    "/favicon.ico",
]


def mask_sensitive_data(data: dict) -> str:
    """個人情報をマスクしてJSON文字列で返す"""
    if not data:
        return ""
    masked = {}
    for key, value in data.items():
        if any(field in key.lower() for field in SENSITIVE_FIELDS):
            masked[key] = "***MASKED***"
        elif isinstance(value, str) and len(value) > 200:
            masked[key] = value[:50] + "...(truncated)"
        else:
            masked[key] = value
    try:
        return json.dumps(masked, ensure_ascii=False, default=str)[:1000]
    except Exception:
        return "(parse error)"


def classify_action(method: str, path: str) -> tuple[str, str, str]:
    """
    リクエストからaction_type, resource_type, resource_idを推定する。
    戻り値: (action_type, resource_type, resource_id)
    """
    # ログイン/ログアウト
    if "login" in path or "auth/signin" in path:
        return ("login", "system", "")
    if "logout" in path or "auth/signout" in path:
        return ("logout", "system", "")

    # リソースタイプ判定
    resource_type = ""
    resource_id = ""
    
    resource_map = {
        "/casts": "cast",
        "/job-seekers": "cast",
        "/shops": "shop",
        "/stores": "shop",
        "/scouts": "scout",
        "/interviews": "interview",
        "/salary": "salary",
        "/links": "link",
        "/access-logs": "system",
        "/concierge": "ai",
    }
    
    for pattern, rtype in resource_map.items():
        if pattern in path:
            resource_type = rtype
            # /casts/123 → resource_id = "123"
            id_match = re.search(rf"{pattern}/(\d+)", path)
            if id_match:
                resource_id = id_match.group(1)
            break

    # アクションタイプ判定
    method_action_map = {
        "GET": "view",
        "POST": "create",
        "PUT": "update",
        "PATCH": "update",
        "DELETE": "delete",
    }
    action_type = method_action_map.get(method.upper(), "view")
    
    # エクスポート検出
    if "export" in path or "download" in path or "csv" in path:
        action_type = "export"

    return (action_type, resource_type, resource_id)


def get_client_ip(request: Request) -> str:
    """リバースプロキシ対応でクライアントIPを取得"""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    if request.client:
        return request.client.host
    return "unknown"


class AccessLogMiddleware(BaseHTTPMiddleware):
    """全リクエストを記録するMiddleware"""

    def __init__(self, app, supabase_client: Client):
        super().__init__(app)
        self.supabase = supabase_client

    async def dispatch(self, request: Request, call_next) -> Response:
        # スキップ対象パス
        if any(request.url.path.startswith(skip) for skip in SKIP_PATHS):
            return await call_next(request)

        start_time = time.time()
        error_message = ""
        response_status = 500  # デフォルト（エラー想定）

        # リクエストボディの読み取り（POST/PUT/PATCHのみ）
        body_summary = ""
        if request.method in ("POST", "PUT", "PATCH"):
            try:
                body = await request.body()
                if body:
                    body_data = json.loads(body)
                    body_summary = mask_sensitive_data(body_data)
                # bodyを再読み取り可能にする
                request._body = body
            except Exception:
                body_summary = "(unreadable)"

        try:
            response = await call_next(request)
            response_status = response.status_code
        except Exception as e:
            error_message = str(e)[:500]
            raise
        finally:
            # レスポンス時間計算
            elapsed_ms = int((time.time() - start_time) * 1000)

            # アクション分類
            action_type, resource_type, resource_id = classify_action(
                request.method, request.url.path
            )

            # エラー判定
            if response_status >= 400:
                action_type = "error" if response_status >= 500 else action_type

            # ユーザー情報取得（Supabase Auth JWTから）
            user_id = None
            user_email = ""
            user_role = "unknown"
            
            auth_header = request.headers.get("authorization", "")
            if auth_header.startswith("Bearer "):
                try:
                    token = auth_header.replace("Bearer ", "")
                    user_resp = self.supabase.auth.get_user(token)
                    if user_resp and user_resp.user:
                        user_id = str(user_resp.user.id)
                        user_email = user_resp.user.email or ""
                        user_role = (
                            user_resp.user.user_metadata.get("role", "scout")
                            if user_resp.user.user_metadata
                            else "scout"
                        )
                except Exception:
                    pass  # トークン無効でもログは記録

            # ログ書き込み（非同期でDBに書き込み。失敗してもリクエスト処理は止めない）
            try:
                self.supabase.table("admin_access_logs").insert({
                    "user_id": user_id,
                    "user_email": user_email,
                    "user_role": user_role,
                    "request_method": request.method,
                    "request_path": str(request.url.path),
                    "request_query": str(request.url.query) if request.url.query else "",
                    "request_body_summary": body_summary,
                    "ip_address": get_client_ip(request),
                    "user_agent": request.headers.get("user-agent", "")[:500],
                    "referer": request.headers.get("referer", "")[:500],
                    "response_status": response_status,
                    "response_time_ms": elapsed_ms,
                    "error_message": error_message,
                    "action_type": action_type,
                    "resource_type": resource_type,
                    "resource_id": resource_id,
                    "session_id": request.cookies.get("session_id", ""),
                }).execute()
            except Exception as log_error:
                # ログ書き込み失敗はprintのみ。リクエスト処理は止めない
                print(f"[AccessLog] Failed to write log: {log_error}")

        return response
