from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """アプリケーション設定"""
    
    # アプリケーション基本設定
    APP_NAME: str = "Nightwork Scout API"
    DEBUG: bool = True
    
    # データベース設定
    DATABASE_URL: str
    
    # Supabase設定
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # xAI API設定
    XAI_API_KEY: str
    XAI_BASE_URL: str = "https://api.x.ai/v1"
    
    # セキュリティ設定
    SECRET_KEY: str
    
    # CORS設定
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """CORS許可オリジンをリスト化"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# グローバル設定インスタンス
settings = Settings()
