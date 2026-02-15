"""
スカウトマン報酬計算エンドポイント

ナイトワーク業界のSB（スカウトマンボーナス）計算を行うAPI。
フロントエンド（frontend/lib/commission.ts）と同じ計算ロジックを使用。
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from app.core.supabase_client import supabase
from decimal import Decimal

router = APIRouter()


# ==================== Request/Response Models ====================

class CommissionCalculateRequest(BaseModel):
    """報酬計算リクエスト"""
    shop_id: Optional[int] = Field(None, description="店舗ID（オプション）")
    cast_estimated_sales: int = Field(..., ge=0, description="キャスト推定月間売上（円）")
    sb_type: Literal["sales_percentage", "salary_percentage", "fixed"] = Field(..., description="SBタイプ")
    sb_rate: float = Field(..., ge=0, description="SB率（%）or 固定額（円）")
    scout_share: float = Field(..., ge=0, le=100, description="スカウト取分（%）")
    payment_cycle: Literal["monthly", "bimonthly"] = Field(default="monthly", description="支払いサイクル")


class RateComparison(BaseModel):
    """SB率別比較結果"""
    rate: int = Field(..., description="SB率（%）")
    scout_income: int = Field(..., description="スカウト収入（円）")
    annual_estimate: int = Field(..., description="年間推定（円）")


class CommissionCalculateResponse(BaseModel):
    """報酬計算レスポンス"""
    sb_total: int = Field(..., description="SB総額（円）")
    scout_income: int = Field(..., description="スカウト収入（円）")
    org_income: int = Field(..., description="会社取分（円）")
    per_payment: int = Field(..., description="1回あたり支払額（円）")
    annual_estimate: int = Field(..., description="年間推定収入（円）")
    formula: str = Field(..., description="計算式")
    rate_comparisons: List[RateComparison] = Field(default_factory=list, description="SB率別比較")


class ShopRateInfo(BaseModel):
    """店舗SB率情報"""
    shop_id: int
    shop_name: str
    sb_type: str
    sb_rate: float
    area: str
    hiring_status: str


class ShopRatesResponse(BaseModel):
    """全店舗SB率レスポンス"""
    shops: List[ShopRateInfo]
    total_count: int


class SimulateRequest(BaseModel):
    """一括シミュレーションリクエスト"""
    cast_estimated_sales: int = Field(..., ge=0, description="キャスト推定月間売上（円）")
    scout_share: float = Field(..., ge=0, le=100, description="スカウト取分（%）")
    shop_ids: List[int] = Field(..., min_length=1, description="比較対象店舗ID配列")


class ShopSimulationResult(BaseModel):
    """店舗別シミュレーション結果"""
    shop_id: int
    shop_name: str
    sb_type: str
    sb_rate: float
    scout_income: int
    annual_estimate: int
    formula: str


class SimulateResponse(BaseModel):
    """一括シミュレーションレスポンス"""
    results: List[ShopSimulationResult]
    best_shop: Optional[ShopSimulationResult] = None
    worst_shop: Optional[ShopSimulationResult] = None
    difference: int = Field(default=0, description="最高と最低の差額（円）")


# ==================== Utility Functions ====================

def calculate_commission(
    cast_estimated_sales: int,
    sb_type: str,
    sb_rate: float,
    scout_share: float,
    payment_cycle: str = "monthly"
) -> dict:
    """
    報酬計算（フロントエンドと同じロジック）
    
    全て整数演算を使用し、浮動小数点誤差を防止。
    """
    # 1. SB総額を計算
    if sb_type == "sales_percentage":
        # 売上ベース
        sb_total = round((cast_estimated_sales * sb_rate) / 100)
        formula_base = f"¥{format_currency(cast_estimated_sales)} × {sb_rate}%"
    elif sb_type == "salary_percentage":
        # 給与ベース（給与は売上の50%と仮定）
        estimated_salary = round(cast_estimated_sales * 0.5)
        sb_total = round((estimated_salary * sb_rate) / 100)
        formula_base = f"¥{format_currency(estimated_salary)}（給与） × {sb_rate}%"
    else:  # fixed
        # 固定額
        sb_total = round(sb_rate)
        formula_base = f"固定 ¥{format_currency(sb_rate)}"
    
    # 2. スカウト取分を計算
    scout_income = round((sb_total * scout_share) / 100)
    org_income = sb_total - scout_income
    
    # 3. 1回あたり支払額を計算
    per_payment = round(scout_income / 2) if payment_cycle == "bimonthly" else scout_income
    
    # 4. 年間推定収入を計算
    annual_estimate = scout_income * 12
    
    # 5. 計算式を生成
    if scout_share == 100:
        formula = f"{formula_base} = ¥{format_currency(scout_income)}/月"
    else:
        formula = f"{formula_base} × {scout_share}% = ¥{format_currency(scout_income)}/月"
    
    return {
        "sb_total": sb_total,
        "scout_income": scout_income,
        "org_income": org_income,
        "per_payment": per_payment,
        "annual_estimate": annual_estimate,
        "formula": formula
    }


def format_currency(amount: float) -> str:
    """金額を日本円フォーマットに変換"""
    return f"{int(round(amount)):,}"


# ==================== Endpoints ====================

@router.post("/calculate", response_model=CommissionCalculateResponse)
def calculate_commission_endpoint(request: CommissionCalculateRequest):
    """
    単一店舗の報酬計算
    
    キャスト売上、SB条件、スカウト取分から報酬を計算。
    オプションでSB率10%/20%/30%/50%の比較も返す。
    """
    # メイン計算
    result = calculate_commission(
        cast_estimated_sales=request.cast_estimated_sales,
        sb_type=request.sb_type,
        sb_rate=request.sb_rate,
        scout_share=request.scout_share,
        payment_cycle=request.payment_cycle
    )
    
    # SB率別比較（sales_percentageの場合のみ）
    rate_comparisons = []
    if request.sb_type == "sales_percentage":
        for rate in [10, 20, 30, 50]:
            comp_result = calculate_commission(
                cast_estimated_sales=request.cast_estimated_sales,
                sb_type="sales_percentage",
                sb_rate=rate,
                scout_share=request.scout_share,
                payment_cycle=request.payment_cycle
            )
            rate_comparisons.append(RateComparison(
                rate=rate,
                scout_income=comp_result["scout_income"],
                annual_estimate=comp_result["annual_estimate"]
            ))
    
    return CommissionCalculateResponse(
        sb_total=result["sb_total"],
        scout_income=result["scout_income"],
        org_income=result["org_income"],
        per_payment=result["per_payment"],
        annual_estimate=result["annual_estimate"],
        formula=result["formula"],
        rate_comparisons=rate_comparisons
    )


@router.get("/shop-rates", response_model=ShopRatesResponse)
def get_shop_rates():
    """
    全店舗のSB率一覧を取得
    
    店舗名、SBタイプ、SB率、エリア、採用状況を返す。
    """
    try:
        # Supabaseから全店舗を取得
        response = supabase.table("shops").select("id, name, sb_type, sb_rate, area, hiring_status").execute()
        
        if not response.data:
            return ShopRatesResponse(shops=[], total_count=0)
        
        shops = [
            ShopRateInfo(
                shop_id=shop["id"],
                shop_name=shop["name"],
                sb_type=shop["sb_type"],
                sb_rate=float(shop["sb_rate"]) if shop["sb_rate"] else 0.0,
                area=shop["area"],
                hiring_status=shop["hiring_status"]
            )
            for shop in response.data
        ]
        
        return ShopRatesResponse(
            shops=shops,
            total_count=len(shops)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"店舗情報の取得に失敗しました: {str(e)}"
        )


@router.post("/simulate", response_model=SimulateResponse)
def simulate_multiple_shops(request: SimulateRequest):
    """
    複数店舗の一括報酬比較
    
    指定された店舗IDリストについて、同じ売上条件でスカウト収入を比較。
    最も有利な店舗、最も不利な店舗、差額を返す。
    """
    try:
        # 指定された店舗情報を取得
        response = supabase.table("shops").select("*").in_("id", request.shop_ids).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="指定された店舗が見つかりません"
            )
        
        # 各店舗の報酬を計算
        results = []
        for shop in response.data:
            result = calculate_commission(
                cast_estimated_sales=request.cast_estimated_sales,
                sb_type=shop["sb_type"],
                sb_rate=float(shop["sb_rate"]) if shop["sb_rate"] else 0.0,
                scout_share=request.scout_share,
                payment_cycle="monthly"
            )
            
            results.append(ShopSimulationResult(
                shop_id=shop["id"],
                shop_name=shop["name"],
                sb_type=shop["sb_type"],
                sb_rate=float(shop["sb_rate"]) if shop["sb_rate"] else 0.0,
                scout_income=result["scout_income"],
                annual_estimate=result["annual_estimate"],
                formula=result["formula"]
            ))
        
        # スカウト収入降順ソート
        results.sort(key=lambda x: x.scout_income, reverse=True)
        
        # 最高と最低を特定
        best_shop = results[0] if results else None
        worst_shop = results[-1] if results else None
        difference = best_shop.scout_income - worst_shop.scout_income if best_shop and worst_shop else 0
        
        return SimulateResponse(
            results=results,
            best_shop=best_shop,
            worst_shop=worst_shop,
            difference=difference
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"シミュレーションの実行に失敗しました: {str(e)}"
        )
