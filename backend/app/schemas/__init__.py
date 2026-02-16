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
    
    # v3拡張: カテゴリ分類
    is_new: bool = Field(default=True, description="新人フラグ")
    cast_category: str = Field(default="new", description="カテゴリ: new/experience/active/returner")
    current_shop: Optional[str] = Field(None, description="現在の所属店舗名")


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
    is_new: Optional[bool] = None
    cast_category: Optional[str] = None
    current_shop: Optional[str] = None


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


# ==================== Interview Schemas ====================

class InterviewBase(BaseModel):
    """面接基本スキーマ"""
    shop_id: int = Field(..., description="店舗ID")
    cast_id: Optional[int] = Field(None, description="キャストID")
    scheduled_at: datetime = Field(..., description="面接予定日時")
    status: str = Field(default="scheduled", description="ステータス: scheduled/completed/cancelled")
    notes: Optional[str] = Field(None, description="備考")


class InterviewCreate(InterviewBase):
    """面接作成スキーマ"""
    pass


class InterviewUpdate(BaseModel):
    """面接更新スキーマ（全フィールドOptional）"""
    shop_id: Optional[int] = None
    cast_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class InterviewResponse(InterviewBase):
    """面接レスポンススキーマ"""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Scout Link Schemas ====================

class ScoutLinkBase(BaseModel):
    """スカウトリンク基本スキーマ"""
    scout_id: int = Field(..., description="スカウトID")
    link_type: str = Field(..., description="リンクタイプ: recruit | app_invite")
    unique_code: str = Field(..., description="ユニークコード")
    short_url: str = Field(..., description="短縮URL")
    qr_code_path: str = Field(default="", description="QRコード画像パス")
    shop_id: Optional[int] = Field(None, description="紹介先店舗ID（recruit用）")
    lp_headline: str = Field(default="", description="LPヘッドライン")
    lp_description: str = Field(default="", description="LP説明文")
    lp_template: str = Field(default="default", description="LPテンプレート")
    is_active: bool = Field(default=True, description="有効フラグ")


class ScoutLinkCreate(ScoutLinkBase):
    """スカウトリンク作成スキーマ"""
    pass


class ScoutLinkUpdate(BaseModel):
    """スカウトリンク更新スキーマ"""
    lp_headline: Optional[str] = None
    lp_description: Optional[str] = None
    lp_template: Optional[str] = None
    is_active: Optional[bool] = None
    force_disabled: Optional[bool] = None
    force_disabled_reason: Optional[str] = None


class ScoutLinkResponse(ScoutLinkBase):
    """スカウトリンクレスポンススキーマ"""
    id: int
    click_count: int
    submission_count: int
    force_disabled: bool
    force_disabled_reason: str
    force_disabled_by: Optional[int]
    force_disabled_at: Optional[datetime]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Link Click Schemas ====================

class LinkClickBase(BaseModel):
    """リンククリック基本スキーマ"""
    link_id: int = Field(..., description="リンクID")
    ip_address: str = Field(default="", description="IPアドレス")
    user_agent: str = Field(default="", description="User-Agent")
    referer: str = Field(default="", description="リファラー")


class LinkClickCreate(LinkClickBase):
    """リンククリック作成スキーマ"""
    pass


class LinkClickResponse(LinkClickBase):
    """リンククリックレスポンススキーマ"""
    id: int
    clicked_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Link Conversion Schemas ====================

class LinkConversionBase(BaseModel):
    """リンクコンバージョン基本スキーマ"""
    link_id: int = Field(..., description="リンクID")
    scout_id: int = Field(..., description="スカウトID")
    conversion_type: str = Field(..., description="コンバージョンタイプ: recruit_apply | app_register")
    name: str = Field(..., description="応募者/登録者名")
    line_id: str = Field(default="", description="LINE ID")
    phone: str = Field(default="", description="電話番号")
    age: Optional[int] = Field(None, description="年齢")
    shop_id: Optional[int] = Field(None, description="店舗ID（recruit用）")
    cast_id: Optional[int] = Field(None, description="キャストID（紐づけ後）")
    status: str = Field(default="submitted", description="ステータス")
    notes: str = Field(default="", description="備考")


class LinkConversionCreate(LinkConversionBase):
    """リンクコンバージョン作成スキーマ"""
    pass


class LinkConversionUpdate(BaseModel):
    """リンクコンバージョン更新スキーマ"""
    status: Optional[str] = None
    cast_id: Optional[int] = None
    contacted_at: Optional[datetime] = None
    interviewed_at: Optional[datetime] = None
    trial_at: Optional[datetime] = None
    hired_at: Optional[datetime] = None
    registered_at: Optional[datetime] = None
    estimated_monthly_sales: Optional[Decimal] = None
    sb_rate: Optional[Decimal] = None
    sb_amount: Optional[Decimal] = None
    scout_share_rate: Optional[Decimal] = None
    scout_income: Optional[Decimal] = None
    is_sb_paid: Optional[bool] = None
    sb_paid_at: Optional[datetime] = None
    notes: Optional[str] = None


class LinkConversionResponse(LinkConversionBase):
    """リンクコンバージョンレスポンススキーマ"""
    id: int
    submitted_at: datetime
    contacted_at: Optional[datetime]
    interviewed_at: Optional[datetime]
    trial_at: Optional[datetime]
    hired_at: Optional[datetime]
    registered_at: Optional[datetime]
    estimated_monthly_sales: Decimal
    sb_rate: Optional[Decimal]
    sb_amount: Decimal
    scout_share_rate: Decimal
    scout_income: Decimal
    is_sb_paid: bool
    sb_paid_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==================== Scout Link Stats Schema ====================

class ScoutLinkStatsResponse(BaseModel):
    """スカウトリンク統計レスポンススキーマ"""
    scout_id: int
    link_type: str
    total_links: int
    total_clicks: int
    total_submissions: int
    cvr_percent: Optional[Decimal]

    model_config = ConfigDict(from_attributes=True)
