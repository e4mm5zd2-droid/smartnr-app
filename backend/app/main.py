from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import router
from app.routers.ai import router as ai_router
from app.routers.ai_matching import router as ai_matching_router
from app.routers.commission import router as commission_router
from app.routers.cast_parser import router as cast_parser_router
from app.routers.scout_links import router as scout_links_router
from app.routers.mini_lp import router as mini_lp_router

# Supabaseを使用するため、SQLAlchemyのテーブル自動作成は不要

# FastAPIアプリケーション初期化
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="1.0.0",
    description="ナイトワークスカウトアプリ - AI顔分析・店舗マッチング機能搭載"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(router, prefix="/api", tags=["CRUD API"])
app.include_router(ai_router, prefix="/api", tags=["AI機能"])
app.include_router(ai_matching_router, prefix="/api", tags=["AIマッチング"])
app.include_router(commission_router, prefix="/api/commission", tags=["報酬計算"])
app.include_router(cast_parser_router, prefix="/api/cast-parser", tags=["キャスト情報解析"])
app.include_router(scout_links_router, prefix="/api/links", tags=["スカウトリンク管理"])
app.include_router(mini_lp_router, prefix="/api", tags=["ミニLP"])


@app.get("/")
def root():
    """ヘルスチェック"""
    return {
        "status": "ok",
        "message": f"{settings.APP_NAME} is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    """ヘルスチェック（詳細）"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "debug": settings.DEBUG
    }
