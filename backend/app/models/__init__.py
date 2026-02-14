from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class JobSeeker(Base):
    """求職者モデル"""
    __tablename__ = "job_seekers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    email = Column(String(100), nullable=True)
    line_id = Column(String(100), nullable=True)
    
    # 希望条件
    desired_position = Column(String(50), nullable=True)  # ボーイ/キャッチ/マネージャー等
    desired_area = Column(String(100), nullable=True)  # 祇園/木屋町/先斗町等
    desired_salary = Column(Integer, nullable=True)  # 希望時給
    
    # ステータス
    is_active = Column(Boolean, default=True)
    is_matched = Column(Boolean, default=False)
    
    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 備考
    notes = Column(Text, nullable=True)


class Store(Base):
    """店舗モデル"""
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    area = Column(String(100), nullable=False)  # 祇園/木屋町/先斗町等
    contact_person = Column(String(100), nullable=True)  # 担当者名
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    
    # 店舗情報
    description = Column(Text, nullable=True)
    
    # ステータス
    is_active = Column(Boolean, default=True)
    
    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # リレーション
    job_postings = relationship("JobPosting", back_populates="store")


class JobPosting(Base):
    """求人モデル"""
    __tablename__ = "job_postings"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    
    # 求人情報
    position = Column(String(50), nullable=False)  # ボーイ/キャッチ/マネージャー等
    hourly_wage = Column(Integer, nullable=False)  # 時給
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)  # 応募条件
    
    # ステータス
    is_active = Column(Boolean, default=True)
    
    # タイムスタンプ
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # リレーション
    store = relationship("Store", back_populates="job_postings")
