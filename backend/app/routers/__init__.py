from fastapi import APIRouter, HTTPException, status
from typing import List

from app.core.supabase_client import supabase
from app.schemas import (
    JobSeekerCreate,
    JobSeekerUpdate,
    JobSeekerResponse,
    StoreCreate,
    StoreResponse,
    JobPostingCreate,
    JobPostingResponse,
)

router = APIRouter()


# ===== 求職者エンドポイント =====
@router.post("/job-seekers", response_model=JobSeekerResponse, status_code=status.HTTP_201_CREATED)
def create_job_seeker(job_seeker: JobSeekerCreate):
    """求職者登録"""
    response = supabase.table("casts").insert(job_seeker.model_dump()).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=500, detail="登録に失敗しました")


@router.get("/job-seekers", response_model=List[JobSeekerResponse])
def get_job_seekers(skip: int = 0, limit: int = 100):
    """求職者一覧取得"""
    response = supabase.table("casts").select("*").range(skip, skip + limit - 1).execute()
    return response.data if response.data else []


@router.get("/job-seekers/{job_seeker_id}", response_model=JobSeekerResponse)
def get_job_seeker(job_seeker_id: int):
    """求職者詳細取得"""
    response = supabase.table("casts").select("*").eq("id", job_seeker_id).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    raise HTTPException(status_code=404, detail="求職者が見つかりません")


@router.patch("/job-seekers/{job_seeker_id}", response_model=JobSeekerResponse)
def update_job_seeker(job_seeker_id: int, job_seeker_update: JobSeekerUpdate):
    """求職者情報更新"""
    update_data = job_seeker_update.model_dump(exclude_unset=True)
    response = supabase.table("casts").update(update_data).eq("id", job_seeker_id).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    raise HTTPException(status_code=404, detail="求職者が見つかりません")


@router.delete("/job-seekers/{job_seeker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_seeker(job_seeker_id: int):
    """求職者削除"""
    response = supabase.table("casts").delete().eq("id", job_seeker_id).execute()
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="求職者が見つかりません")
    return None


# ===== 店舗エンドポイント =====
@router.post("/stores", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(store: StoreCreate):
    """店舗登録"""
    response = supabase.table("shops").insert(store.model_dump()).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=500, detail="登録に失敗しました")


@router.get("/stores", response_model=List[StoreResponse])
def get_stores(skip: int = 0, limit: int = 100):
    """店舗一覧取得"""
    response = supabase.table("shops").select("*").range(skip, skip + limit - 1).execute()
    return response.data if response.data else []


@router.get("/stores/{store_id}", response_model=StoreResponse)
def get_store(store_id: int):
    """店舗詳細取得"""
    response = supabase.table("shops").select("*").eq("id", store_id).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    raise HTTPException(status_code=404, detail="店舗が見つかりません")


# ===== 求人エンドポイント =====
@router.post("/job-postings", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
def create_job_posting(job_posting: JobPostingCreate):
    """求人登録"""
    # 店舗存在確認
    store_check = supabase.table("shops").select("id").eq("id", job_posting.store_id).execute()
    if not store_check.data or len(store_check.data) == 0:
        raise HTTPException(status_code=404, detail="店舗が見つかりません")
    
    response = supabase.table("interviews").insert(job_posting.model_dump()).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=500, detail="登録に失敗しました")


@router.get("/job-postings", response_model=List[JobPostingResponse])
def get_job_postings(skip: int = 0, limit: int = 100):
    """求人一覧取得"""
    response = supabase.table("interviews").select("*, shops(*)").range(skip, skip + limit - 1).execute()
    return response.data if response.data else []


@router.get("/job-postings/{job_posting_id}", response_model=JobPostingResponse)
def get_job_posting(job_posting_id: int):
    """求人詳細取得"""
    response = supabase.table("interviews").select("*, shops(*)").eq("id", job_posting_id).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]
    raise HTTPException(status_code=404, detail="求人が見つかりません")
