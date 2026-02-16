from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, extract
from app.core.database import get_db
from app.models import ScoutLink, Scout, Shop, LinkConversion, LinkClick, Cast
from datetime import datetime, date
from decimal import Decimal

router = APIRouter()


# ═══════════════════════════════════════
# 認証ヘルパー
# ═══════════════════════════════════════

def verify_master(scout_id: int, db: Session):
    """role='admin'（マスター権限）チェック"""
    scout = db.query(Scout).filter(Scout.id == scout_id).first()
    if not scout:
        raise HTTPException(status_code=404, detail="Scout not found")
    
    # scoutsテーブルのrole='admin'がマスター権限
    if not hasattr(scout, 'role') or scout.role != 'admin':
        raise HTTPException(status_code=403, detail="Master access required")
    
    return scout


# ═══════════════════════════════════════
# レスポンススキーマ
# ═══════════════════════════════════════

class FunnelStats(BaseModel):
    submitted: int = 0
    contacted: int = 0
    interviewed: int = 0
    trial: int = 0
    hired: int = 0
    active: int = 0
    registered: int = 0
    churned: int = 0


class TypeStats(BaseModel):
    total_links: int
    active_links: int
    total_clicks: int
    total_submissions: int
    overall_cvr: float
    funnel: FunnelStats
    total_sb_earned: Optional[int] = None
    unpaid_sb: Optional[int] = None


class OverviewResponse(BaseModel):
    period: str
    recruit: TypeStats
    app_invite: TypeStats
    active_scouts: int
    top_performer_scout_id: Optional[int]
    top_performer_name: Optional[str]


class ScoutPerformance(BaseModel):
    scout_id: int
    name: str
    recruit: dict
    app_invite: dict
    total_score: int
    rank: int


class ScoutsRankingResponse(BaseModel):
    scouts: List[ScoutPerformance]
    total_scouts: int


class ConversionItem(BaseModel):
    id: int
    conversion_type: str
    name: str
    line_id: str
    age: Optional[int]
    status: str
    scout_name: str
    scout_id: int
    shop_name: Optional[str]
    submitted_at: str
    contacted_at: Optional[str]
    interviewed_at: Optional[str]
    sb_amount: float
    is_sb_paid: bool
    notes: str


class ConversionsListResponse(BaseModel):
    conversions: List[ConversionItem]
    total: int
    page: int
    per_page: int


class StatusUpdateRequest(BaseModel):
    status: str
    notes: str = ""
    estimated_monthly_sales: Optional[int] = None


class SBUpdateRequest(BaseModel):
    sb_amount: int
    scout_income: int
    is_sb_paid: bool
    notes: str = ""


class BulkPayRequest(BaseModel):
    conversion_ids: List[int]
    notes: str = ""


class LinkForceToggleRequest(BaseModel):
    force_disabled: bool
    reason: str = ""


class DailyReportResponse(BaseModel):
    date: str
    new_clicks: int
    new_submissions: int
    status_changes: List[dict]
    new_app_registrations: int
    alerts: List[dict]


# ═══════════════════════════════════════
# エンドポイント
# ═══════════════════════════════════════

@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    master_id: int,
    period: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """組織全体の統計サマリー"""
    verify_master(master_id, db)
    
    # 期間フィルター（簡易版：当月）
    if period is None:
        period = datetime.now().strftime("%Y-%m")
    
    # recruit統計
    recruit_links = db.query(ScoutLink).filter(ScoutLink.link_type == "recruit").all()
    recruit_active = sum(1 for link in recruit_links if link.is_active)
    recruit_clicks = sum(link.click_count for link in recruit_links)
    recruit_submissions = sum(link.submission_count for link in recruit_links)
    recruit_cvr = round((recruit_submissions / recruit_clicks * 100), 1) if recruit_clicks > 0 else 0.0
    
    # recruitファネル
    recruit_conversions = db.query(LinkConversion).filter(
        LinkConversion.conversion_type == "recruit_apply"
    ).all()
    
    recruit_funnel = FunnelStats(
        submitted=sum(1 for c in recruit_conversions),
        contacted=sum(1 for c in recruit_conversions if c.contacted_at),
        interviewed=sum(1 for c in recruit_conversions if c.interviewed_at),
        trial=sum(1 for c in recruit_conversions if c.trial_at),
        hired=sum(1 for c in recruit_conversions if c.hired_at),
        active=sum(1 for c in recruit_conversions if c.status == 'active'),
    )
    
    total_sb = sum(float(c.sb_amount or 0) for c in recruit_conversions)
    unpaid_sb = sum(float(c.sb_amount or 0) for c in recruit_conversions if not c.is_sb_paid)
    
    # app_invite統計
    app_links = db.query(ScoutLink).filter(ScoutLink.link_type == "app_invite").all()
    app_active = sum(1 for link in app_links if link.is_active)
    app_clicks = sum(link.click_count for link in app_links)
    app_submissions = sum(link.submission_count for link in app_links)
    app_cvr = round((app_submissions / app_clicks * 100), 1) if app_clicks > 0 else 0.0
    
    app_conversions = db.query(LinkConversion).filter(
        LinkConversion.conversion_type == "app_register"
    ).all()
    
    app_funnel = FunnelStats(
        submitted=sum(1 for c in app_conversions),
        registered=sum(1 for c in app_conversions if c.registered_at),
        active=sum(1 for c in app_conversions if c.status == 'active'),
        churned=sum(1 for c in app_conversions if c.status == 'churned'),
    )
    
    # アクティブスカウト数
    active_scouts = db.query(Scout).count()
    
    # トップパフォーマー（SB合計が最も高いスカウト）
    top_performer = db.query(
        LinkConversion.scout_id,
        func.sum(LinkConversion.scout_income).label('total_income')
    ).group_by(LinkConversion.scout_id).order_by(desc('total_income')).first()
    
    top_performer_id = None
    top_performer_name = None
    if top_performer:
        top_scout = db.query(Scout).filter(Scout.id == top_performer[0]).first()
        if top_scout:
            top_performer_id = top_scout.id
            top_performer_name = top_scout.name
    
    return OverviewResponse(
        period=period,
        recruit=TypeStats(
            total_links=len(recruit_links),
            active_links=recruit_active,
            total_clicks=recruit_clicks,
            total_submissions=recruit_submissions,
            overall_cvr=recruit_cvr,
            funnel=recruit_funnel,
            total_sb_earned=int(total_sb),
            unpaid_sb=int(unpaid_sb),
        ),
        app_invite=TypeStats(
            total_links=len(app_links),
            active_links=app_active,
            total_clicks=app_clicks,
            total_submissions=app_submissions,
            overall_cvr=app_cvr,
            funnel=app_funnel,
        ),
        active_scouts=active_scouts,
        top_performer_scout_id=top_performer_id,
        top_performer_name=top_performer_name,
    )


@router.get("/scouts", response_model=ScoutsRankingResponse)
def get_scouts_ranking(
    master_id: int,
    sort_by: str = "sb_earned",
    period: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """全スカウトの成績ランキング"""
    verify_master(master_id, db)
    
    scouts = db.query(Scout).all()
    
    result = []
    for scout in scouts:
        # recruit統計
        recruit_links = db.query(ScoutLink).filter(
            ScoutLink.scout_id == scout.id,
            ScoutLink.link_type == "recruit"
        ).all()
        
        recruit_clicks = sum(link.click_count for link in recruit_links)
        recruit_submissions = sum(link.submission_count for link in recruit_links)
        recruit_cvr = round((recruit_submissions / recruit_clicks * 100), 1) if recruit_clicks > 0 else 0.0
        
        recruit_conversions = db.query(LinkConversion).filter(
            LinkConversion.scout_id == scout.id,
            LinkConversion.conversion_type == "recruit_apply"
        ).all()
        
        recruit_hired = sum(1 for c in recruit_conversions if c.hired_at)
        recruit_sb = sum(float(c.scout_income or 0) for c in recruit_conversions)
        
        # app_invite統計
        app_links = db.query(ScoutLink).filter(
            ScoutLink.scout_id == scout.id,
            ScoutLink.link_type == "app_invite"
        ).all()
        
        app_clicks = sum(link.click_count for link in app_links)
        app_submissions = sum(link.submission_count for link in app_links)
        app_cvr = round((app_submissions / app_clicks * 100), 1) if app_clicks > 0 else 0.0
        
        app_conversions = db.query(LinkConversion).filter(
            LinkConversion.scout_id == scout.id,
            LinkConversion.conversion_type == "app_register",
            LinkConversion.status == "active"
        ).count()
        
        result.append({
            "scout_id": scout.id,
            "name": scout.name,
            "recruit": {
                "links": len(recruit_links),
                "clicks": recruit_clicks,
                "submissions": recruit_submissions,
                "cvr": recruit_cvr,
                "hired": recruit_hired,
                "sb_earned": int(recruit_sb),
            },
            "app_invite": {
                "links": len(app_links),
                "clicks": app_clicks,
                "submissions": app_submissions,
                "cvr": app_cvr,
                "active_users": app_conversions,
            },
            "total_score": int(recruit_sb),
        })
    
    # ソート
    if sort_by == "sb_earned":
        result.sort(key=lambda x: x["recruit"]["sb_earned"], reverse=True)
    elif sort_by == "submissions":
        result.sort(key=lambda x: x["recruit"]["submissions"] + x["app_invite"]["submissions"], reverse=True)
    elif sort_by == "cvr":
        result.sort(key=lambda x: x["recruit"]["cvr"], reverse=True)
    
    # ランク付与
    for idx, scout_data in enumerate(result, 1):
        scout_data["rank"] = idx
    
    return ScoutsRankingResponse(
        scouts=[ScoutPerformance(**s) for s in result],
        total_scouts=len(scouts)
    )


@router.get("/scouts/{scout_id}")
def get_scout_detail(
    scout_id: int,
    master_id: int,
    db: Session = Depends(get_db)
):
    """特定スカウトの詳細データ"""
    verify_master(master_id, db)
    
    scout = db.query(Scout).filter(Scout.id == scout_id).first()
    if not scout:
        raise HTTPException(status_code=404, detail="Scout not found")
    
    # リンク一覧
    links = db.query(ScoutLink).filter(ScoutLink.scout_id == scout_id).all()
    links_data = []
    
    for link in links:
        shop_name = None
        if link.shop_id:
            shop = db.query(Shop).filter(Shop.id == link.shop_id).first()
            if shop:
                shop_name = shop.name
        
        cvr = round((link.submission_count / link.click_count * 100), 1) if link.click_count > 0 else 0.0
        
        links_data.append({
            "id": link.id,
            "link_type": link.link_type,
            "unique_code": link.unique_code,
            "short_url": link.short_url,
            "shop_name": shop_name,
            "click_count": link.click_count,
            "submission_count": link.submission_count,
            "cvr": cvr,
            "is_active": link.is_active,
            "force_disabled": link.force_disabled,
            "created_at": link.created_at.isoformat() if link.created_at else "",
        })
    
    # コンバージョン一覧
    conversions = db.query(LinkConversion).filter(LinkConversion.scout_id == scout_id).all()
    conversions_data = []
    
    for conv in conversions:
        shop_name = None
        if conv.shop_id:
            shop = db.query(Shop).filter(Shop.id == conv.shop_id).first()
            if shop:
                shop_name = shop.name
        
        conversions_data.append({
            "id": conv.id,
            "conversion_type": conv.conversion_type,
            "name": conv.name,
            "age": conv.age,
            "status": conv.status,
            "submitted_at": conv.submitted_at.isoformat() if conv.submitted_at else "",
            "shop_name": shop_name,
            "sb_amount": float(conv.sb_amount or 0),
            "notes": conv.notes,
        })
    
    # 月次トレンド（簡易版）
    monthly_trend = []  # TODO: 実装
    
    return {
        "scout_id": scout.id,
        "name": scout.name,
        "links": links_data,
        "conversions": conversions_data,
        "monthly_trend": monthly_trend,
    }


@router.get("/conversions", response_model=ConversionsListResponse)
def get_all_conversions(
    master_id: int,
    conversion_type: str = Query(default="all"),
    status: str = Query(default="all"),
    scout_id: Optional[int] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    page: int = 1,
    db: Session = Depends(get_db)
):
    """全スカウトのコンバージョン一覧"""
    verify_master(master_id, db)
    
    query = db.query(LinkConversion)
    
    if conversion_type != "all":
        query = query.filter(LinkConversion.conversion_type == conversion_type)
    
    if status != "all":
        query = query.filter(LinkConversion.status == status)
    
    if scout_id:
        query = query.filter(LinkConversion.scout_id == scout_id)
    
    if search:
        query = query.filter(LinkConversion.name.ilike(f"%{search}%"))
    
    # ソート
    if sort == "newest":
        query = query.order_by(desc(LinkConversion.created_at))
    elif sort == "oldest":
        query = query.order_by(LinkConversion.created_at)
    
    # ページネーション
    per_page = 20
    total = query.count()
    conversions = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # データ整形
    result = []
    for conv in conversions:
        scout = db.query(Scout).filter(Scout.id == conv.scout_id).first()
        shop_name = None
        if conv.shop_id:
            shop = db.query(Shop).filter(Shop.id == conv.shop_id).first()
            if shop:
                shop_name = shop.name
        
        result.append(ConversionItem(
            id=conv.id,
            conversion_type=conv.conversion_type,
            name=conv.name,
            line_id=conv.line_id,
            age=conv.age,
            status=conv.status,
            scout_name=scout.name if scout else "",
            scout_id=conv.scout_id,
            shop_name=shop_name,
            submitted_at=conv.submitted_at.isoformat() if conv.submitted_at else "",
            contacted_at=conv.contacted_at.isoformat() if conv.contacted_at else None,
            interviewed_at=conv.interviewed_at.isoformat() if conv.interviewed_at else None,
            sb_amount=float(conv.sb_amount or 0),
            is_sb_paid=conv.is_sb_paid,
            notes=conv.notes,
        ))
    
    return ConversionsListResponse(
        conversions=result,
        total=total,
        page=page,
        per_page=per_page,
    )


@router.patch("/conversions/{conversion_id}/status")
def update_conversion_status_master(
    conversion_id: int,
    master_id: int,
    request: StatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """マスターがステータスを直接変更"""
    verify_master(master_id, db)
    
    conversion = db.query(LinkConversion).filter(LinkConversion.id == conversion_id).first()
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")
    
    conversion.status = request.status
    conversion.notes = request.notes
    
    now = datetime.now()
    
    # ステータス変更時の日時記録
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
    
    # hiredの場合、SB自動計算
    if request.status == "hired" and request.estimated_monthly_sales:
        conversion.estimated_monthly_sales = request.estimated_monthly_sales
        
        # 店舗のSB率取得
        if conversion.shop_id:
            shop = db.query(Shop).filter(Shop.id == conversion.shop_id).first()
            if shop:
                conversion.sb_rate = shop.sb_rate
                sb_amount = float(request.estimated_monthly_sales) * float(shop.sb_rate) / 100
                conversion.sb_amount = sb_amount
                conversion.scout_income = sb_amount * float(conversion.scout_share_rate or 70) / 100
    
    # activeの場合、castsテーブルも更新
    if request.status == "active" and conversion.cast_id:
        cast = db.query(Cast).filter(Cast.id == conversion.cast_id).first()
        if cast:
            cast.cast_category = 'active'
            cast.status = '稼働中'
    
    conversion.updated_at = now
    db.commit()
    
    return {"success": True, "status": conversion.status}


@router.patch("/conversions/{conversion_id}/sb")
def update_sb_amount(
    conversion_id: int,
    master_id: int,
    request: SBUpdateRequest,
    db: Session = Depends(get_db)
):
    """SB金額の手動調整"""
    verify_master(master_id, db)
    
    conversion = db.query(LinkConversion).filter(LinkConversion.id == conversion_id).first()
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")
    
    conversion.sb_amount = request.sb_amount
    conversion.scout_income = request.scout_income
    conversion.is_sb_paid = request.is_sb_paid
    conversion.notes = request.notes
    
    if request.is_sb_paid:
        conversion.sb_paid_at = datetime.now()
    
    conversion.updated_at = datetime.now()
    db.commit()
    
    return {"success": True}


@router.patch("/conversions/bulk-pay")
def bulk_pay_sb(
    master_id: int,
    request: BulkPayRequest,
    db: Session = Depends(get_db)
):
    """SB一括支払い処理"""
    verify_master(master_id, db)
    
    conversions = db.query(LinkConversion).filter(
        LinkConversion.id.in_(request.conversion_ids)
    ).all()
    
    now = datetime.now()
    for conv in conversions:
        conv.is_sb_paid = True
        conv.sb_paid_at = now
        conv.notes = f"{conv.notes}\n{request.notes}" if conv.notes else request.notes
        conv.updated_at = now
    
    db.commit()
    
    return {"success": True, "paid_count": len(conversions)}


@router.get("/links")
def get_all_links(
    master_id: int,
    link_type: str = "all",
    scout_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    sort: str = "newest",
    db: Session = Depends(get_db)
):
    """全スカウトのリンク一覧"""
    verify_master(master_id, db)
    
    query = db.query(ScoutLink)
    
    if link_type != "all":
        query = query.filter(ScoutLink.link_type == link_type)
    
    if scout_id:
        query = query.filter(ScoutLink.scout_id == scout_id)
    
    if is_active is not None:
        query = query.filter(ScoutLink.is_active == is_active)
    
    if sort == "newest":
        query = query.order_by(desc(ScoutLink.created_at))
    elif sort == "clicks":
        query = query.order_by(desc(ScoutLink.click_count))
    elif sort == "cvr":
        query = query.order_by(desc(ScoutLink.submission_count / func.nullif(ScoutLink.click_count, 0)))
    
    links = query.all()
    
    result = []
    for link in links:
        scout = db.query(Scout).filter(Scout.id == link.scout_id).first()
        shop_name = None
        if link.shop_id:
            shop = db.query(Shop).filter(Shop.id == link.shop_id).first()
            if shop:
                shop_name = shop.name
        
        cvr = round((link.submission_count / link.click_count * 100), 1) if link.click_count > 0 else 0.0
        
        result.append({
            "id": link.id,
            "scout_name": scout.name if scout else "",
            "scout_id": link.scout_id,
            "link_type": link.link_type,
            "unique_code": link.unique_code,
            "short_url": link.short_url,
            "shop_name": shop_name,
            "click_count": link.click_count,
            "submission_count": link.submission_count,
            "cvr": cvr,
            "is_active": link.is_active,
            "force_disabled": link.force_disabled,
            "created_at": link.created_at.isoformat() if link.created_at else "",
        })
    
    return {"links": result}


@router.patch("/links/{link_id}/force-toggle")
def force_toggle_link(
    link_id: int,
    master_id: int,
    request: LinkForceToggleRequest,
    db: Session = Depends(get_db)
):
    """マスターがリンクを強制停止/再開"""
    verify_master(master_id, db)
    
    link = db.query(ScoutLink).filter(ScoutLink.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    link.force_disabled = request.force_disabled
    link.force_disabled_reason = request.reason
    link.force_disabled_by = master_id
    link.force_disabled_at = datetime.now() if request.force_disabled else None
    
    db.commit()
    
    return {"success": True, "force_disabled": link.force_disabled}


@router.post("/links/generate-for-scout")
def generate_link_for_scout(
    master_id: int,
    scout_id: int,
    link_type: str,
    shop_id: Optional[int] = None,
    lp_headline: str = "",
    lp_template: str = "default",
    db: Session = Depends(get_db)
):
    """マスターが特定スカウトに代わってリンクを発行"""
    verify_master(master_id, db)
    
    # scout_links.pyのgenerate_link関数を再利用
    from app.routers.scout_links import generate_unique_code, generate_qr_code
    
    scout = db.query(Scout).filter(Scout.id == scout_id).first()
    if not scout:
        raise HTTPException(status_code=404, detail="Scout not found")
    
    unique_code = generate_unique_code(scout.name, link_type, db)
    
    from app.routers.scout_links import SMARTNR_BASE_URL
    short_url = f"{SMARTNR_BASE_URL}/r/{unique_code}"
    qr_code_base64 = generate_qr_code(short_url)
    
    new_link = ScoutLink(
        scout_id=scout_id,
        link_type=link_type,
        unique_code=unique_code,
        short_url=short_url,
        qr_code_path="",
        shop_id=shop_id,
        lp_headline=lp_headline,
        lp_template=lp_template,
    )
    
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    
    return {
        "success": True,
        "link_id": new_link.id,
        "unique_code": unique_code,
        "short_url": short_url,
        "qr_code_base64": qr_code_base64,
    }


@router.get("/daily-report", response_model=DailyReportResponse)
def get_daily_report(
    master_id: int,
    db: Session = Depends(get_db)
):
    """今日のデータ速報"""
    verify_master(master_id, db)
    
    today = date.today()
    
    # 今日のクリック数
    new_clicks = db.query(LinkClick).filter(
        func.date(LinkClick.clicked_at) == today
    ).count()
    
    # 今日の応募数
    new_submissions = db.query(LinkConversion).filter(
        func.date(LinkConversion.submitted_at) == today
    ).count()
    
    # 今日のステータス変更（updated_atが今日のもの）
    status_changes = db.query(LinkConversion).filter(
        func.date(LinkConversion.updated_at) == today,
        LinkConversion.status != 'submitted'
    ).all()
    
    changes_list = []
    for conv in status_changes:
        scout = db.query(Scout).filter(Scout.id == conv.scout_id).first()
        changes_list.append({
            "name": conv.name,
            "from": "submitted",  # TODO: 前のステータスを保存する必要がある
            "to": conv.status,
            "scout": scout.name if scout else "",
        })
    
    # 今日のアプリ登録
    new_app_registrations = db.query(LinkConversion).filter(
        func.date(LinkConversion.registered_at) == today,
        LinkConversion.conversion_type == "app_register"
    ).count()
    
    # アラート生成（簡易版）
    alerts = []
    
    # 低CVRスカウトを検出
    scouts = db.query(Scout).all()
    for scout in scouts:
        links = db.query(ScoutLink).filter(
            ScoutLink.scout_id == scout.id,
            ScoutLink.link_type == "recruit"
        ).all()
        
        total_clicks = sum(link.click_count for link in links)
        total_subs = sum(link.submission_count for link in links)
        
        if total_clicks > 30:  # 最低30クリックあるスカウトのみ判定
            cvr = (total_subs / total_clicks * 100) if total_clicks > 0 else 0
            if cvr < 5:
                alerts.append({
                    "type": "low_cvr",
                    "message": f"{scout.name}のCVRが{cvr:.1f}%。リンクの見直しを推奨"
                })
    
    # ハイパフォーマー検出
    for scout in scouts:
        hired_count = db.query(LinkConversion).filter(
            LinkConversion.scout_id == scout.id,
            LinkConversion.conversion_type == "recruit_apply",
            LinkConversion.hired_at.isnot(None),
            extract('month', LinkConversion.hired_at) == today.month,
            extract('year', LinkConversion.hired_at) == today.year
        ).count()
        
        if hired_count >= 10:
            alerts.append({
                "type": "high_performer",
                "message": f"{scout.name}が今月{hired_count}人採用。過去最高ペース"
            })
    
    return DailyReportResponse(
        date=today.isoformat(),
        new_clicks=new_clicks,
        new_submissions=new_submissions,
        status_changes=changes_list,
        new_app_registrations=new_app_registrations,
        alerts=alerts,
    )
