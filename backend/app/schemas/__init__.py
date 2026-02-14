from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ===== キャスト（求職者）スキーマ =====
class JobSeekerBase(BaseModel):
    """キャスト基本スキーマ"""
    genji_name: str
    age: int
    phone: str
    real_name_initial: Optional[str] = None
    line_id: Optional[str] = None
    looks_tags: Optional[list[str]] = None
    status: str = "募集中"
    photos_url: Optional[str] = None
    scout_id: Optional[int] = None


class JobSeekerCreate(JobSeekerBase):
    """キャスト作成スキーマ"""
    pass


class JobSeekerUpdate(BaseModel):
    """キャスト更新スキーマ"""
    genji_name: Optional[str] = None
    real_name_initial: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    line_id: Optional[str] = None
    looks_tags: Optional[list[str]] = None
    status: Optional[str] = None
    photos_url: Optional[str] = None
    scout_id: Optional[int] = None


class JobSeekerResponse(BaseModel):
    """キャストレスポンススキーマ"""
    id: int
    scout_id: Optional[int] = None
    genji_name: str
    real_name_initial: Optional[str] = None
    age: int
    phone: str
    line_id: Optional[str] = None
    looks_tags: Optional[list[str]] = None
    status: str
    photos_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== 店舗スキーマ =====
class StoreBase(BaseModel):
    """店舗基本スキーマ"""
    name: str
    area: str
    system_type: str
    hourly_wage_min: int
    hourly_wage_max: int
    description: Optional[str] = None
    target_age_min: Optional[int] = None
    target_age_max: Optional[int] = None


class StoreCreate(StoreBase):
    """店舗作成スキーマ"""
    pass


class StoreResponse(StoreBase):
    """店舗レスポンススキーマ"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== 求人スキーマ =====
class JobPostingBase(BaseModel):
    """求人基本スキーマ"""
    position: str
    hourly_wage: int
    description: Optional[str] = None
    requirements: Optional[str] = None


class JobPostingCreate(JobPostingBase):
    """求人作成スキーマ"""
    store_id: int


class JobPostingResponse(JobPostingBase):
    """求人レスポンススキーマ"""
    id: int
    store_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    store: StoreResponse
    
    class Config:
        from_attributes = True
