from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# データベースエンジン作成
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True,  # 接続チェック
    echo=settings.DEBUG  # SQLログ出力（開発時のみ）
)

# セッションローカル作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ベースクラス作成
Base = declarative_base()


def get_db():
    """データベースセッション取得（依存性注入用）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
