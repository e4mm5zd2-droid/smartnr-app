from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import ScoutLink, Scout, Shop, LinkClick, LinkConversion
from datetime import datetime

router = APIRouter()


class RedirectResponse(BaseModel):
    redirect_url: str


class LPDataResponse(BaseModel):
    link_type: str
    scout_name: str
    shop_name: Optional[str]
    headline: str
    description: str
    template: str
    unique_code: str


class LPSubmitRequest(BaseModel):
    name: str
    line_id: str = ""
    age: Optional[int] = None
    phone: str = ""


class LPSubmitResponse(BaseModel):
    success: bool
    message: str


@router.post("/r/{unique_code}", response_model=RedirectResponse)
async def redirect_short_url(
    unique_code: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """短縮URLアクセス → クリック記録＋リダイレクト先を返す"""
    
    # リンク検索
    link = db.query(ScoutLink).filter(ScoutLink.unique_code == unique_code).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # 無効チェック
    if not link.is_active or link.force_disabled:
        return RedirectResponse(redirect_url="/lp/disabled")
    
    # クリック数+1
    link.click_count += 1
    
    # クリックログ記録
    client_ip = request.client.host if request.client else ""
    user_agent = request.headers.get("user-agent", "")
    referer = request.headers.get("referer", "")
    
    click_log = LinkClick(
        link_id=link.id,
        ip_address=client_ip,
        user_agent=user_agent,
        referer=referer,
    )
    db.add(click_log)
    db.commit()
    
    # リダイレクト先を返す
    if link.link_type == "recruit":
        redirect_url = f"/lp/recruit/{unique_code}"
    elif link.link_type == "app_invite":
        redirect_url = f"/lp/app-invite/{unique_code}"
    else:
        redirect_url = "/lp/disabled"
    
    return RedirectResponse(redirect_url=redirect_url)


@router.get("/lp/data/{unique_code}", response_model=LPDataResponse)
def get_lp_data(unique_code: str, db: Session = Depends(get_db)):
    """ミニLPに表示するデータを返す"""
    
    link = db.query(ScoutLink).filter(ScoutLink.unique_code == unique_code).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # スカウト情報取得
    scout = db.query(Scout).filter(Scout.id == link.scout_id).first()
    scout_name = scout.name if scout else "スカウト"
    
    # 店舗情報取得
    shop_name = None
    if link.shop_id:
        shop = db.query(Shop).filter(Shop.id == link.shop_id).first()
        if shop:
            shop_name = shop.name
    
    # ヘッドライン・説明のデフォルト
    if link.link_type == "recruit":
        default_headline = "ナイトワーク始めませんか？"
        default_description = "月収30万円〜も可能。未経験OK。完全サポートでナイトワークデビュー。"
    else:
        default_headline = "指名が増える。売上が見える。"
        default_description = "SmartNR キャスト版で効率的に働く。売上管理・シフト管理・指名分析。"
    
    return LPDataResponse(
        link_type=link.link_type,
        scout_name=scout_name,
        shop_name=shop_name,
        headline=link.lp_headline if link.lp_headline else default_headline,
        description=link.lp_description if link.lp_description else default_description,
        template=link.lp_template,
        unique_code=link.unique_code,
    )


@router.post("/lp/submit/{unique_code}", response_model=LPSubmitResponse)
def submit_lp_form(
    unique_code: str,
    request: LPSubmitRequest,
    db: Session = Depends(get_db)
):
    """ミニLPからの応募/登録を受け付ける"""
    
    link = db.query(ScoutLink).filter(ScoutLink.unique_code == unique_code).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    if not link.is_active or link.force_disabled:
        raise HTTPException(status_code=400, detail="このリンクは現在利用できません")
    
    # submission_count +1
    link.submission_count += 1
    
    # conversion_type決定
    conversion_type = "recruit_apply" if link.link_type == "recruit" else "app_register"
    
    # link_conversionsにINSERT
    conversion = LinkConversion(
        link_id=link.id,
        scout_id=link.scout_id,
        conversion_type=conversion_type,
        name=request.name,
        line_id=request.line_id,
        phone=request.phone,
        age=request.age,
        shop_id=link.shop_id,
        status="submitted",
    )
    
    db.add(conversion)
    db.commit()
    
    return LPSubmitResponse(
        success=True,
        message="ありがとうございます！担当者からご連絡します。"
    )
