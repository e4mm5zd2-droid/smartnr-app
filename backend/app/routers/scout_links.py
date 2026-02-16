from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models import ScoutLink, Scout, Shop, LinkConversion
import qrcode
from io import BytesIO
import base64
import random
import string
import os

router = APIRouter()

SMARTNR_BASE_URL = os.getenv("SMARTNR_BASE_URL", "http://localhost:3000")


class LinkGenerateRequest(BaseModel):
    scout_id: int
    link_type: str  # "recruit" or "app_invite"
    shop_id: Optional[int] = None
    lp_headline: str = ""
    lp_description: str = ""
    lp_template: str = "default"


class LinkGenerateResponse(BaseModel):
    id: int
    link_type: str
    unique_code: str
    short_url: str
    qr_code_base64: str
    shop_name: Optional[str] = None
    scout_name: str


class MyLinkItem(BaseModel):
    id: int
    link_type: str
    unique_code: str
    short_url: str
    shop_name: Optional[str]
    click_count: int
    submission_count: int
    cvr: float
    is_active: bool
    force_disabled: bool
    created_at: str


class MyLinksResponse(BaseModel):
    links: List[MyLinkItem]


class DashboardStats(BaseModel):
    total_links: int
    total_clicks: int
    total_submissions: int
    cvr: float
    funnel: dict
    total_sb_earned: Optional[int] = None
    unpaid_sb: Optional[int] = None


class DashboardResponse(BaseModel):
    recruit: DashboardStats
    app_invite: DashboardStats


class LinkToggleResponse(BaseModel):
    success: bool
    is_active: bool


class ConversionStatusUpdateRequest(BaseModel):
    status: str
    notes: str = ""


def generate_unique_code(scout_name: str, link_type: str, db: Session) -> str:
    """ユニークコードを生成（ASCII文字のみ・重複チェック付き）"""
    type_prefix = "RCT" if link_type == "recruit" else "APP"
    
    max_attempts = 10
    for _ in range(max_attempts):
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        unique_code = f"{type_prefix}-{random_part}"
        
        # 重複チェック
        existing = db.query(ScoutLink).filter(ScoutLink.unique_code == unique_code).first()
        if not existing:
            return unique_code
    
    raise HTTPException(status_code=500, detail="Failed to generate unique code")


def generate_qr_code(url: str) -> str:
    """QRコード画像を生成してbase64文字列を返す"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{qr_base64}"


@router.post("/generate", response_model=LinkGenerateResponse)
def generate_link(request: LinkGenerateRequest, db: Session = Depends(get_db)):
    """スカウト紹介リンクを発行"""
    
    try:
        # スカウト情報取得
        scout = db.query(Scout).filter(Scout.id == request.scout_id).first()
        if not scout:
            raise HTTPException(status_code=404, detail="Scout not found")
        
        # 店舗情報取得（recruitの場合）
        shop_name = None
        if request.link_type == "recruit" and request.shop_id:
            shop = db.query(Shop).filter(Shop.id == request.shop_id).first()
            if shop:
                shop_name = shop.name
        
        # unique_code生成
        unique_code = generate_unique_code(scout.name, request.link_type, db)
        
        # short_url構築
        short_url = f"{SMARTNR_BASE_URL}/r/{unique_code}"
        
        # QRコード生成
        qr_code_base64 = generate_qr_code(short_url)
        
        # DBに保存
        new_link = ScoutLink(
            scout_id=request.scout_id,
            link_type=request.link_type,
            unique_code=unique_code,
            short_url=short_url,
            qr_code_path="",
            shop_id=request.shop_id,
            lp_headline=request.lp_headline,
            lp_description=request.lp_description,
            lp_template=request.lp_template,
        )
        
        db.add(new_link)
        db.commit()
        db.refresh(new_link)
        
        return LinkGenerateResponse(
            id=new_link.id,
            link_type=new_link.link_type,
            unique_code=new_link.unique_code,
            short_url=new_link.short_url,
            qr_code_base64=qr_code_base64,
            shop_name=shop_name,
            scout_name=scout.name,
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error: {type(e).__name__}: {str(e)}")


@router.get("/my-links", response_model=MyLinksResponse)
def get_my_links(
    scout_id: int,
    link_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """自分が発行したリンク一覧"""
    
    query = db.query(ScoutLink).filter(ScoutLink.scout_id == scout_id)
    
    if link_type:
        query = query.filter(ScoutLink.link_type == link_type)
    
    links = query.order_by(ScoutLink.created_at.desc()).all()
    
    result = []
    for link in links:
        shop_name = None
        if link.shop_id:
            shop = db.query(Shop).filter(Shop.id == link.shop_id).first()
            if shop:
                shop_name = shop.name
        
        cvr = round((link.submission_count / link.click_count * 100), 1) if link.click_count > 0 else 0.0
        
        result.append(MyLinkItem(
            id=link.id,
            link_type=link.link_type,
            unique_code=link.unique_code,
            short_url=link.short_url,
            shop_name=shop_name,
            click_count=link.click_count,
            submission_count=link.submission_count,
            cvr=cvr,
            is_active=link.is_active,
            force_disabled=link.force_disabled,
            created_at=link.created_at.isoformat() if link.created_at else "",
        ))
    
    return MyLinksResponse(links=result)


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(scout_id: int, db: Session = Depends(get_db)):
    """スカウト個人のダッシュボード統計"""
    
    # recruit統計
    recruit_links = db.query(ScoutLink).filter(
        ScoutLink.scout_id == scout_id,
        ScoutLink.link_type == "recruit"
    ).all()
    
    recruit_clicks = sum(link.click_count for link in recruit_links)
    recruit_submissions = sum(link.submission_count for link in recruit_links)
    recruit_cvr = round((recruit_submissions / recruit_clicks * 100), 1) if recruit_clicks > 0 else 0.0
    
    # recruitファネル
    recruit_conversions = db.query(LinkConversion).filter(
        LinkConversion.scout_id == scout_id,
        LinkConversion.conversion_type == "recruit_apply"
    ).all()
    
    recruit_funnel = {
        "submitted": sum(1 for c in recruit_conversions if c.status in ['submitted', 'contacted', 'interviewed', 'trial', 'hired', 'active']),
        "contacted": sum(1 for c in recruit_conversions if c.status in ['contacted', 'interviewed', 'trial', 'hired', 'active']),
        "interviewed": sum(1 for c in recruit_conversions if c.status in ['interviewed', 'trial', 'hired', 'active']),
        "trial": sum(1 for c in recruit_conversions if c.status in ['trial', 'hired', 'active']),
        "hired": sum(1 for c in recruit_conversions if c.status in ['hired', 'active']),
        "active": sum(1 for c in recruit_conversions if c.status == 'active'),
    }
    
    # SB合計
    total_sb = sum(float(c.scout_income or 0) for c in recruit_conversions)
    unpaid_sb = sum(float(c.scout_income or 0) for c in recruit_conversions if not c.is_sb_paid)
    
    # app_invite統計
    app_links = db.query(ScoutLink).filter(
        ScoutLink.scout_id == scout_id,
        ScoutLink.link_type == "app_invite"
    ).all()
    
    app_clicks = sum(link.click_count for link in app_links)
    app_submissions = sum(link.submission_count for link in app_links)
    app_cvr = round((app_submissions / app_clicks * 100), 1) if app_clicks > 0 else 0.0
    
    # app_inviteファネル
    app_conversions = db.query(LinkConversion).filter(
        LinkConversion.scout_id == scout_id,
        LinkConversion.conversion_type == "app_register"
    ).all()
    
    app_funnel = {
        "submitted": sum(1 for c in app_conversions if c.status in ['submitted', 'registered', 'active']),
        "registered": sum(1 for c in app_conversions if c.status in ['registered', 'active']),
        "active": sum(1 for c in app_conversions if c.status == 'active'),
        "churned": sum(1 for c in app_conversions if c.status == 'churned'),
    }
    
    return DashboardResponse(
        recruit=DashboardStats(
            total_links=len(recruit_links),
            total_clicks=recruit_clicks,
            total_submissions=recruit_submissions,
            cvr=recruit_cvr,
            funnel=recruit_funnel,
            total_sb_earned=int(total_sb),
            unpaid_sb=int(unpaid_sb),
        ),
        app_invite=DashboardStats(
            total_links=len(app_links),
            total_clicks=app_clicks,
            total_submissions=app_submissions,
            cvr=app_cvr,
            funnel=app_funnel,
        )
    )


@router.patch("/{link_id}/toggle", response_model=LinkToggleResponse)
def toggle_link(link_id: int, scout_id: int, db: Session = Depends(get_db)):
    """リンクの有効/無効を切り替え"""
    
    link = db.query(ScoutLink).filter(
        ScoutLink.id == link_id,
        ScoutLink.scout_id == scout_id
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    if link.force_disabled:
        raise HTTPException(status_code=403, detail="このリンクは管理者によって強制停止されています")
    
    link.is_active = not link.is_active
    db.commit()
    
    return LinkToggleResponse(success=True, is_active=link.is_active)


@router.get("/conversions")
def get_conversions(
    scout_id: int,
    conversion_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """自分のコンバージョン一覧"""
    
    query = db.query(LinkConversion).filter(LinkConversion.scout_id == scout_id)
    
    if conversion_type:
        query = query.filter(LinkConversion.conversion_type == conversion_type)
    
    if status:
        query = query.filter(LinkConversion.status == status)
    
    conversions = query.order_by(LinkConversion.created_at.desc()).all()
    
    return {"conversions": [
        {
            "id": c.id,
            "link_id": c.link_id,
            "conversion_type": c.conversion_type,
            "name": c.name,
            "line_id": c.line_id,
            "phone": c.phone,
            "age": c.age,
            "status": c.status,
            "shop_id": c.shop_id,
            "cast_id": c.cast_id,
            "scout_income": float(c.scout_income or 0),
            "is_sb_paid": c.is_sb_paid,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in conversions
    ]}


@router.patch("/conversions/{conversion_id}/status")
def update_conversion_status(
    conversion_id: int,
    request: ConversionStatusUpdateRequest,
    scout_id: int,
    db: Session = Depends(get_db)
):
    """コンバージョンのステータスを更新"""
    
    conversion = db.query(LinkConversion).filter(
        LinkConversion.id == conversion_id,
        LinkConversion.scout_id == scout_id
    ).first()
    
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")
    
    conversion.status = request.status
    conversion.notes = request.notes
    
    # ステータスに応じた日時を記録
    from datetime import datetime
    now = datetime.now()
    
    if request.status == "contacted" and not conversion.contacted_at:
        conversion.contacted_at = now
    elif request.status == "interviewed" and not conversion.interviewed_at:
        conversion.interviewed_at = now
    elif request.status == "trial" and not conversion.trial_at:
        conversion.trial_at = now
    elif request.status == "hired" and not conversion.hired_at:
        conversion.hired_at = now
    elif request.status == "registered" and not conversion.registered_at:
        conversion.registered_at = now
    
    conversion.updated_at = now
    db.commit()
    
    return {"success": True, "status": conversion.status}
