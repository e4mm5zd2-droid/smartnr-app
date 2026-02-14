from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from app.core.xai_client import xai_client
from app.core.supabase_client import supabase
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ==================== Request/Response Models ====================

class AIMatchingRequest(BaseModel):
    """AIマッチングリクエスト"""
    cast_id: Optional[int] = Field(None, description="既存キャストID（オプション）")
    age: Optional[int] = Field(None, ge=18, le=60, description="年齢（手動入力）")
    looks_tags: List[str] = Field(default_factory=list, description="ルックスタグ")
    experience: str = Field(default="未経験", description="経験レベル")
    preferred_area: str = Field(default="", description="希望エリア")
    personality: str = Field(default="", description="性格・特徴")
    priority: str = Field(default="働きやすさ", description="優先条件")


class ShopRecommendation(BaseModel):
    """店舗推薦結果"""
    shop_id: int
    shop_name: str
    match_score: float = Field(..., ge=0, le=100, description="マッチング度（0-100）")
    ai_reason: str = Field(..., description="マッチング理由（AI生成）")
    hourly_wage_min: Optional[int]
    hourly_wage_max: Optional[int]
    sb_rate: float = Field(..., description="スカウトマン報酬率（%）")
    manager_name: str = Field(default="", description="店長名")
    manager_tip: str = Field(default="", description="店長からのアドバイス")


class AIMatchingResponse(BaseModel):
    """AIマッチングレスポンス"""
    recommendations: List[ShopRecommendation] = Field(default_factory=list)
    ai_summary: str = Field(..., description="全体サマリー（AI生成）")
    warning: Optional[str] = Field(None, description="警告メッセージ")


# ==================== AI Matching Endpoint ====================

SYSTEM_PROMPT = """あなたはナイトワーク業界に精通したキャスト配置の専門家です。
キャスト候補の情報と店舗リストを照合し、最適な配置先を提案してください。

判断基準（優先度順）:
1. ルックス・雰囲気と店舗の客層の一致度
2. 年齢と店舗のターゲット年齢層の一致度
3. 経験レベルと店舗の教育体制
4. 希望条件（エリア・時給・働き方）との一致度
5. 店舗の現在の採用意欲

出力ルール:
- 1〜5件の店舗を推薦（マッチング度の高い順）
- 各店舗に0〜100のmatch_scoreを付与
- ai_reasonは2〜3文で具体的に（抽象的表現禁止）
- 面接のコツがあれば含める
- ポジティブな表現を使う
- 必ずJSON形式で回答（マークダウン・コードブロック不可）
- JSONスキーマ: {"recommendations": [{"shop_id": int, "match_score": float, "ai_reason": str}], "ai_summary": str}
"""


@router.post("/ai-matching", response_model=AIMatchingResponse)
async def ai_matching(request: AIMatchingRequest):
    """
    キャスト×店舗のAIマッチング
    
    キャスト情報を元に、最適な店舗を推薦します。
    xAI Grok APIを使用して、業界知識に基づいた提案を生成します。
    """
    try:
        # 1. キャスト情報の取得
        cast_data = {}
        if request.cast_id:
            # 既存キャストから情報取得
            result = supabase.table("casts").select("*").eq("id", request.cast_id).single().execute()
            if result.data:
                cast_data = result.data
                age = cast_data.get("age")
                looks_tags = cast_data.get("looks_tags", [])
                experience = cast_data.get("experience", "未経験")
                preferred_area = cast_data.get("preferred_area", "")
                personality = cast_data.get("personality", "")
                priority = cast_data.get("priority", "働きやすさ")
            else:
                raise HTTPException(status_code=404, detail="キャストが見つかりません")
        else:
            # 手動入力データを使用
            age = request.age
            looks_tags = request.looks_tags
            experience = request.experience
            preferred_area = request.preferred_area
            personality = request.personality
            priority = request.priority
        
        # 年齢が必須
        if age is None:
            raise HTTPException(status_code=400, detail="年齢情報が必要です")
        
        # 2. アクティブな店舗を全て取得
        shops_result = supabase.table("shops").select("*").eq("hiring_status", "active").execute()
        
        if not shops_result.data or len(shops_result.data) == 0:
            return AIMatchingResponse(
                recommendations=[],
                ai_summary="現在、採用中の店舗がありません。",
                warning="active状態の店舗が0件です。"
            )
        
        shops = shops_result.data
        
        # 3. xAI Grok APIに送信
        user_prompt = f"""
【キャスト情報】
- 年齢: {age}歳
- ルックス: {', '.join(looks_tags) if looks_tags else '未指定'}
- 経験: {experience}
- 希望エリア: {preferred_area if preferred_area else '未指定'}
- 性格: {personality if personality else '未指定'}
- 優先条件: {priority}

【店舗リスト】
{json.dumps(shops, ensure_ascii=False, indent=2)}

上記のキャストに最適な店舗を1〜5件推薦してください。
JSONフォーマット（マークダウン不可）で回答してください。
"""

        # xAI API呼び出し
        try:
            completion = xai_client.chat.completions.create(
                model="grok-2-1212",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=2000,
                timeout=30.0
            )
            
            ai_response = completion.choices[0].message.content.strip()
            
            # JSONパース（マークダウンコードブロックを除去）
            if ai_response.startswith("```"):
                # ```json ... ``` を除去
                ai_response = ai_response.split("```")[1]
                if ai_response.startswith("json"):
                    ai_response = ai_response[4:].strip()
            
            ai_result = json.loads(ai_response)
            
        except Exception as e:
            logger.error(f"xAI API Error: {e}")
            # フォールバック: 基本的なルールベースマッチング
            return fallback_matching(shops, age, looks_tags, preferred_area, priority)
        
        # 4. レスポンス構築
        recommendations = []
        for rec in ai_result.get("recommendations", [])[:5]:
            shop_id = rec.get("shop_id")
            shop = next((s for s in shops if s.get("id") == shop_id), None)
            
            if shop:
                recommendations.append(ShopRecommendation(
                    shop_id=shop_id,
                    shop_name=rec.get("shop_name", shop.get("name")),
                    match_score=rec.get("match_score", 0),
                    ai_reason=rec.get("ai_reason", "マッチング度が高いです。"),
                    hourly_wage_min=shop.get("hourly_wage_min"),
                    hourly_wage_max=shop.get("hourly_wage_max"),
                    sb_rate=float(shop.get("sb_rate", 20)),
                    manager_name=shop.get("manager_name", ""),
                    manager_tip=shop.get("manager_tip", "")
                ))
        
        return AIMatchingResponse(
            recommendations=recommendations,
            ai_summary=ai_result.get("ai_summary", "最適な店舗を提案しました。"),
            warning=None
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI Matching Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AIマッチング処理でエラーが発生しました: {str(e)}"
        )


def fallback_matching(shops: list, age: int, looks_tags: List[str], preferred_area: str, priority: str) -> AIMatchingResponse:
    """
    フォールバック: ルールベースマッチング
    AIが失敗した場合の代替処理
    """
    recommendations = []
    
    for shop in shops[:5]:
        # 簡易スコア計算
        score = 50.0  # ベーススコア
        
        # 年齢マッチング
        target_min = shop.get("target_age_min", 20)
        target_max = shop.get("target_age_max", 30)
        if target_min <= age <= target_max:
            score += 20
        
        # エリアマッチング
        if preferred_area and preferred_area in shop.get("area", ""):
            score += 15
        
        # 時給マッチング
        if priority == "高時給":
            wage_max = shop.get("hourly_wage_max", 0)
            if wage_max >= 5000:
                score += 15
        
        recommendations.append(ShopRecommendation(
            shop_id=shop.get("id"),
            shop_name=shop.get("name"),
            match_score=min(score, 100),
            ai_reason=f"年齢層が合致しています。{shop.get('description', '')}",
            hourly_wage_min=shop.get("hourly_wage_min"),
            hourly_wage_max=shop.get("hourly_wage_max"),
            sb_rate=float(shop.get("sb_rate", 20)),
            manager_name=shop.get("manager_name", ""),
            manager_tip=shop.get("manager_tip", "")
        ))
    
    # スコア降順ソート
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    
    return AIMatchingResponse(
        recommendations=recommendations[:5],
        ai_summary="基本的なマッチング条件に基づいて店舗を提案しました。",
        warning="AIマッチングエンジンが一時的に利用できません。基本マッチングを使用しました。"
    )
