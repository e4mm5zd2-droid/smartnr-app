from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import List
import base64
import json

from app.core.xai_client import xai_client
from app.core.supabase_client import supabase

router = APIRouter()


class FaceAnalysisResponse(BaseModel):
    """顔分析レスポンス"""
    age_range: str
    tags: List[str]
    hairstyle: str


class ShopRecommendation(BaseModel):
    """店舗レコメンド"""
    id: int
    name: str
    area: str
    system_type: str
    hourly_wage_min: int
    hourly_wage_max: int
    match_score: float
    reason: str


@router.post("/analyze-face", response_model=FaceAnalysisResponse)
async def analyze_face(file: UploadFile = File(...)):
    """
    顔画像を分析し、推定年齢・雰囲気タグ・髪型を返す
    
    xAI Grok Vision APIを使用して画像を分析します。
    """
    try:
        # 画像ファイルを読み込み
        contents = await file.read()
        
        # Base64エンコード
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        # xAI Grok Vision APIに送信
        response = xai_client.chat.completions.create(
            model="grok-3-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """この女性の写真を分析し、以下の情報をJSON形式で返してください：
                            
                            {
                                "age_range": "推定年齢帯（例: 20-23歳）",
                                "tags": ["雰囲気タグのリスト（例: ギャル, 清楚, モデル系, 可愛い系, 大人, セクシー など）"],
                                "hairstyle": "髪型の説明（例: ロング, ショート, ボブ, 黒髪, 茶髪 など）"
                            }
                            
                            必ずJSON形式のみで返答してください。"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # レスポンスからJSON抽出
        result_text = response.choices[0].message.content.strip()
        
        # JSONブロックを抽出（```json ... ``` の場合に対応）
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        result = json.loads(result_text)
        
        return FaceAnalysisResponse(**result)
        
    except json.JSONDecodeError as e:
        import traceback
        error_detail = f"AI応答のJSON解析に失敗: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI応答のJSON解析に失敗しました: {str(e)}"
        )
    except Exception as e:
        import traceback
        error_detail = f"画像分析エラー: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"画像分析に失敗しました: {str(e)}"
        )


@router.get("/shops/recommend", response_model=List[ShopRecommendation])
async def recommend_shops(
    age: int = None,
    tags: str = None,  # カンマ区切りのタグ（例: "ギャル,明るい"）
    limit: int = 5
):
    """
    キャストの特徴に基づいて最適な店舗を推薦
    
    年齢・タグを元にマッチング精度を計算し、適合度の高い店舗を返します。
    """
    try:
        # Supabaseから店舗一覧を取得
        response = supabase.table("shops").select("*").execute()
        shops = response.data if response.data else []
        
        if not shops:
            return []
        
        # タグをリスト化
        tag_list = [t.strip() for t in tags.split(",")] if tags else []
        
        # 各店舗のマッチング精度を計算
        recommendations = []
        for shop in shops:
            match_score = 0.0
            reasons = []
            
            # 年齢マッチング
            if age:
                target_min = shop.get("target_age_min")
                target_max = shop.get("target_age_max")
                if target_min and target_max:
                    if target_min <= age <= target_max:
                        match_score += 40.0
                        age_range_text = str(target_min) + "-" + str(target_max)
                        reasons.append("年齢が最適範囲（" + age_range_text + "歳）")
                    elif abs(age - target_min) <= 3 or abs(age - target_max) <= 3:
                        match_score += 20.0
                        reasons.append("年齢が近い")
            
            # タグマッチング（簡易版：店舗typeとエリアで判定）
            if tag_list:
                system_type = shop.get("system_type", "")
                # ギャル系 → キャバクラ・ガールズバー
                if any(t in ["ギャル", "明るい"] for t in tag_list):
                    if system_type in ["キャバクラ", "ガールズバー"]:
                        match_score += 30.0
                        reasons.append("雰囲気がマッチ")
                
                # 清楚・大人系 → ラウンジ・クラブ
                if any(t in ["清楚", "上品", "大人", "セクシー"] for t in tag_list):
                    if system_type in ["ラウンジ", "クラブ"]:
                        match_score += 30.0
                        reasons.append("上品な雰囲気に最適")
            
            # 時給マッチング（高時給優先）
            hourly_max = shop.get("hourly_wage_max")
            if hourly_max:
                if hourly_max >= 5000:
                    match_score += 15.0
                    reasons.append("高時給")
                elif hourly_max >= 3500:
                    match_score += 10.0
            
            # エリアボーナス（歌舞伎町・六本木・北新地は人気エリア）
            shop_area = shop.get("area", "")
            if shop_area in ["歌舞伎町", "六本木", "北新地"]:
                match_score += 15.0
                reasons.append("人気エリア")
            
            recommendations.append(ShopRecommendation(
                id=shop.get("id", 0),
                name=shop.get("name", ""),
                area=shop_area,
                system_type=shop.get("system_type", ""),
                hourly_wage_min=shop.get("hourly_wage_min", 0),
                hourly_wage_max=shop.get("hourly_wage_max", 0),
                match_score=match_score,
                reason=" / ".join(reasons) if reasons else "基本マッチング"
            ))
        
        # マッチング精度でソート
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        
        return recommendations[:limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"店舗レコメンドに失敗しました: {str(e)}"
        )
