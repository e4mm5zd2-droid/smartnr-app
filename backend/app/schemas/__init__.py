from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ==================== Shop Schemas ====================

class ShopBase(BaseModel):
    """店舗基本スキーマ"""
    name: str = Field(..., min_length=1, max_length=100)
    area: str = Field(..., min_length=1, max_length=100)
    system_type: Optional[str] = Field(None, description="キャバクラ, ラウンジ, ガールズバー等")
    hourly_wage_min: Optional[int] = Field(None, ge=0)
    hourly_wage_max: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    target_age_min: Optional[int] = Field(None, ge=18, le=60)
    target_age_max: Optional[int] = Field(None, ge=18, le=60)
    
    # v2拡張
    back_rate: int = Field(default=50, ge=0, le=100, description="バック率（%）")
    manager_name: str = Field(default="", description="店長名")
    manager_tip: str = Field(default="", description="店長からのアドバイス")
    hiring_status: str = Field(default="active", description="採用状況: active/limited/closed")
    atmosphere_tags: List[str] = Field(default_factory=list, description="雰囲気タグ")
    education_level: str = Field(default="standard", description="教育体制: none/basic/standard/excellent")
    sb_type: str = Field(default="sales_percentage", description="報酬タイプ: sales_percentage/salary_percentage/fixed")
    sb_rate: Decimal = Field(default=Decimal("20.00"), ge=0, le=100, description="報酬率（%）")
    sb_note: str = Field(default="", description="報酬備考")
    payment_cycle: str = Field(default="monthly", description="給料サイクル: daily/weekly/biweekly/monthly")


class ShopCreate(ShopBase):
    """店舗作成スキーマ"""
    pass


class ShopUpdate(BaseModel):
    """店舗更新スキーマ（全フィールドOptional）"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    area: Optional[str] = None
    system_type: Optional[str] = None
    hourly_wage_min: Optional[int] = None
    hourly_wage_max: Optional[int] = None
    description: Optional[str] = None
    target_age_min: Optional[int] = None
    target_age_max: Optional[int] = None
    back_rate: Optional[int] = Field(None, ge=0, le=100)
    manager_name: Optional[str] = None
    manager_tip: Optional[str] = None
    hiring_status: Optional[str] = None
    atmosphere_tags: Optional[List[str]] = None
    education_level: Optional[str] = None
    sb_type: Optional[str] = None
    sb_rate: Optional[Decimal] = None
    sb_note: Optional[str] = None
    payment_cycle: Optional[str] = None


class ShopResponse(ShopBase):
    """店舗レスポンススキーマ"""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Cast Schemas ====================

class CastBase(BaseModel):
    """キャスト基本スキーマ"""
    genji_name: str = Field(..., min_length=1, max_length=100, description="源氏名")
    real_name_initial: Optional[str] = Field(None, max_length=10, description="本名イニシャル")
    age: int = Field(..., ge=18, le=60)
    phone: str = Field(..., min_length=10, max_length=20)
    line_id: Optional[str] = Field(None, max_length=100)
    looks_tags: List[str] = Field(default_factory=list, description="ルックスタグ")
    status: str = Field(default="募集中", description="ステータス: 募集中/面接済/採用決定")
    photos_url: Optional[str] = None
    notes: Optional[str] = None
    
    # v2拡張
    experience: str = Field(default="未経験", description="経験: 未経験/半年未満/1年以上/3年以上")
    personality: str = Field(default="", description="性格・特徴")
    preferred_area: str = Field(default="", description="希望エリア")
    priority: str = Field(default="働きやすさ", description="優先条件: 高時給/働きやすさ/知名度/成長環境")


class CastCreate(CastBase):
    """キャスト作成スキーマ"""
    scout_id: Optional[int] = None


class CastUpdate(BaseModel):
    """キャスト更新スキーマ（全フィールドOptional）"""
    genji_name: Optional[str] = None
    real_name_initial: Optional[str] = None
    age: Optional[int] = Field(None, ge=18, le=60)
    phone: Optional[str] = None
    line_id: Optional[str] = None
    looks_tags: Optional[List[str]] = None
    status: Optional[str] = None
    photos_url: Optional[str] = None
    notes: Optional[str] = None
    experience: Optional[str] = None
    personality: Optional[str] = None
    preferred_area: Optional[str] = None
    priority: Optional[str] = None


class CastResponse(CastBase):
    """キャストレスポンススキーマ"""
    id: int
    scout_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== AI Matching Schemas ====================

class MatchingRequest(BaseModel):
    """AIマッチングリクエスト"""
    cast_id: int = Field(..., description="キャストID")
    limit: int = Field(default=5, ge=1, le=20, description="推薦店舗数")


class MatchingScore(BaseModel):
    """マッチングスコア"""
    shop_id: int
    shop_name: str
    score: float = Field(..., ge=0, le=100, description="マッチング度（0-100）")
    reasons: List[str] = Field(default_factory=list, description="マッチング理由")
    shop: ShopResponse


class MatchingResponse(BaseModel):
    """AIマッチングレスポンス"""
    cast: CastResponse
    recommended_shops: List[MatchingScore] = Field(default_factory=list)
    total_count: int = Field(default=0, description="推薦店舗総数")


# ==================== Scout Bonus Schemas ====================

class BonusCalculationRequest(BaseModel):
    """報酬計算リクエスト"""
    scout_id: int = Field(..., description="スカウトマンID")
    shop_id: int = Field(..., description="店舗ID")
    cast_id: int = Field(..., description="キャストID")
    sales_amount: Optional[int] = Field(None, ge=0, description="売上額（円）")
    salary_amount: Optional[int] = Field(None, ge=0, description="給与額（円）")


class BonusCalculationResponse(BaseModel):
    """報酬計算レスポンス"""
    scout_id: int
    shop_id: int
    cast_id: int
    bonus_type: str = Field(..., description="報酬タイプ")
    bonus_rate: Decimal = Field(..., description="報酬率（%）")
    base_amount: int = Field(..., description="基準額（円）")
    bonus_amount: int = Field(..., description="報酬額（円）")
    note: str = Field(default="", description="備考")
