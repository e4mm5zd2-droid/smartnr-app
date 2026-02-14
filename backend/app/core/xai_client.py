from openai import OpenAI
from app.core.config import settings

# xAI Grokクライアント初期化（OpenAI SDK互換モード）
xai_client = OpenAI(
    api_key=settings.XAI_API_KEY,
    base_url=settings.XAI_BASE_URL
)
