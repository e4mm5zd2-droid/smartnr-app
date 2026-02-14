from supabase import create_client, Client
from app.core.config import settings

# Supabaseクライアント初期化
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
