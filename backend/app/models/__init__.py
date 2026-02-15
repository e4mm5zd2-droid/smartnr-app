from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, ARRAY, Numeric, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from typing import List


class Shop(Base):
    """店舗モデル（Supabase shopsテーブル）"""
    __tablename__ = "shops"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    area = Column(Text, nullable=False)
    system_type = Column(Text, nullable=True)  # キャバクラ, ラウンジ, ガールズバー等
    hourly_wage_min = Column(Integer, nullable=True)
    hourly_wage_max = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    target_age_min = Column(Integer, nullable=True)
    target_age_max = Column(Integer, nullable=True)
    
    # v2拡張: AIマッチング・報酬計算用
    back_rate = Column(Integer, default=50)  # バック率（%）
    manager_name = Column(Text, default='')  # 店長名
    manager_tip = Column(Text, default='')  # 店長からのアドバイス
    hiring_status = Column(Text, default='active')  # 'active' | 'limited' | 'closed'
    atmosphere_tags = Column(JSONB, default=list)  # ["アットホーム", "高級志向"]
    education_level = Column(Text, default='standard')  # 'none' | 'basic' | 'standard' | 'excellent'
    sb_type = Column(Text, default='sales_percentage')  # 'sales_percentage' | 'salary_percentage' | 'fixed'
    sb_rate = Column(Numeric(5, 2), default=20.00)  # スカウトマン報酬率（%）
    sb_note = Column(Text, default='')  # 報酬備考
    payment_cycle = Column(Text, default='monthly')  # 'daily' | 'weekly' | 'biweekly' | 'monthly'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Cast(Base):
    """キャストモデル（Supabase castsテーブル）"""
    __tablename__ = "casts"
    
    id = Column(Integer, primary_key=True, index=True)
    scout_id = Column(Integer, ForeignKey("scouts.id"), nullable=True)
    genji_name = Column(Text, nullable=False)  # 源氏名
    real_name_initial = Column(Text, nullable=True)  # 本名イニシャル
    age = Column(Integer, nullable=False)
    phone = Column(Text, nullable=False)
    line_id = Column(Text, nullable=True)
    looks_tags = Column(JSONB, default=list)  # ["可愛い系", "大人っぽい"]
    status = Column(Text, default='募集中')  # 募集中, 面接済, 採用決定
    photos_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # v2拡張: AIマッチング用
    experience = Column(Text, default='未経験')  # '未経験' | '半年未満' | '1年以上' | '3年以上'
    personality = Column(Text, default='')  # 性格・特徴（自由記述）
    preferred_area = Column(Text, default='')  # 希望エリア
    priority = Column(Text, default='働きやすさ')  # '高時給' | '働きやすさ' | '知名度' | '成長環境'
    
    # v3拡張: カテゴリ分類
    is_new = Column(Boolean, default=True)  # True=新人、False=既存
    cast_category = Column(Text, default='new')  # 'new', 'experience', 'active', 'returner'
    current_shop = Column(Text, nullable=True)  # 現在の所属店舗名（activeの場合）
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Scout(Base):
    """スカウトマンモデル（Supabase scoutsテーブル）"""
    __tablename__ = "scouts"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False)
    name = Column(Text, nullable=False)
    rank = Column(Text, default='bronze')  # bronze, silver, gold, platinum, diamond
    experience_years = Column(Integer, default=0)
    total_recruited = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Interview(Base):
    """面接履歴モデル（Supabase interviewsテーブル）"""
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    cast_id = Column(Integer, ForeignKey("casts.id"), nullable=False)
    cast_name = Column(Text, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    time = Column(Text, nullable=False)
    location = Column(Text, nullable=False)
    note = Column(Text, nullable=True)
    status = Column(Text, default='scheduled')  # scheduled, confirmed, completed, cancelled
    scout_id = Column(Integer, ForeignKey("scouts.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
