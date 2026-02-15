"""
報酬計算APIのテストスクリプト

FastAPIの報酬計算エンドポイントをテスト。
フロントエンドのcommission.tsと同じ結果が返ることを検証。
"""

import requests
import json

BASE_URL = "http://localhost:8000"  # ローカル開発用
# BASE_URL = "https://smartnr-backend.onrender.com"  # 本番環境用

print("=== 報酬計算API テスト ===\n")

# ==================== Test 1: 単一店舗計算 ====================

print("【テスト1】単一店舗の報酬計算（売上ベース）")
payload = {
    "cast_estimated_sales": 500000,
    "sb_type": "sales_percentage",
    "sb_rate": 20,
    "scout_share": 70,
    "payment_cycle": "monthly"
}

try:
    response = requests.post(f"{BASE_URL}/api/commission/calculate", json=payload)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ ステータス: {response.status_code}")
        print(f"  SB総額: ¥{data['sb_total']:,}")
        print(f"  スカウト収入: ¥{data['scout_income']:,}")
        print(f"  会社取分: ¥{data['org_income']:,}")
        print(f"  年間推定: ¥{data['annual_estimate']:,}")
        print(f"  計算式: {data['formula']}")
        print(f"  SB率比較: {len(data['rate_comparisons'])}件")
        
        # 期待値との比較
        assert data['sb_total'] == 100000, "SB総額が正しくありません"
        assert data['scout_income'] == 70000, "スカウト収入が正しくありません"
        assert data['org_income'] == 30000, "会社取分が正しくありません"
        assert data['annual_estimate'] == 840000, "年間推定が正しくありません"
        print("✅ 全ての値が期待値と一致\n")
    else:
        print(f"❌ エラー: {response.status_code} - {response.text}\n")
except Exception as e:
    print(f"❌ 接続エラー: {e}\n")

# ==================== Test 2: 固定額（隔月） ====================

print("【テスト2】固定額（隔月支払い）")
payload2 = {
    "cast_estimated_sales": 500000,
    "sb_type": "fixed",
    "sb_rate": 80000,
    "scout_share": 100,
    "payment_cycle": "bimonthly"
}

try:
    response = requests.post(f"{BASE_URL}/api/commission/calculate", json=payload2)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ ステータス: {response.status_code}")
        print(f"  SB総額: ¥{data['sb_total']:,}")
        print(f"  スカウト収入: ¥{data['scout_income']:,}")
        print(f"  隔月支払額: ¥{data['per_payment']:,}")
        print(f"  年間推定: ¥{data['annual_estimate']:,}")
        print(f"  計算式: {data['formula']}")
        
        assert data['per_payment'] == 40000, "隔月支払額が正しくありません"
        assert data['annual_estimate'] == 960000, "年間推定が正しくありません"
        print("✅ 全ての値が期待値と一致\n")
    else:
        print(f"❌ エラー: {response.status_code} - {response.text}\n")
except Exception as e:
    print(f"❌ 接続エラー: {e}\n")

# ==================== Test 3: 全店舗SB率取得 ====================

print("【テスト3】全店舗のSB率一覧取得")
try:
    response = requests.get(f"{BASE_URL}/api/commission/shop-rates")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ ステータス: {response.status_code}")
        print(f"  店舗数: {data['total_count']}件")
        if data['shops']:
            print("\n  店舗一覧:")
            for shop in data['shops'][:3]:  # 最初の3件のみ表示
                print(f"    - {shop['shop_name']} ({shop['area']})")
                print(f"      SBタイプ: {shop['sb_type']}, SB率: {shop['sb_rate']}%")
                print(f"      採用状況: {shop['hiring_status']}")
        print("✅ 正常取得\n")
    else:
        print(f"❌ エラー: {response.status_code} - {response.text}\n")
except Exception as e:
    print(f"❌ 接続エラー: {e}\n")

# ==================== Test 4: 複数店舗シミュレーション ====================

print("【テスト4】複数店舗の一括比較シミュレーション")
payload3 = {
    "cast_estimated_sales": 500000,
    "scout_share": 70,
    "shop_ids": [1, 2, 3, 4, 5]
}

try:
    response = requests.post(f"{BASE_URL}/api/commission/simulate", json=payload3)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ ステータス: {response.status_code}")
        print(f"  比較店舗数: {len(data['results'])}件")
        
        if data['best_shop']:
            print(f"\n  【最も有利】{data['best_shop']['shop_name']}")
            print(f"    スカウト収入: ¥{data['best_shop']['scout_income']:,}/月")
            print(f"    年間推定: ¥{data['best_shop']['annual_estimate']:,}")
        
        if data['worst_shop']:
            print(f"\n  【最も不利】{data['worst_shop']['shop_name']}")
            print(f"    スカウト収入: ¥{data['worst_shop']['scout_income']:,}/月")
            print(f"    年間推定: ¥{data['worst_shop']['annual_estimate']:,}")
        
        if data['difference']:
            print(f"\n  【差額】¥{data['difference']:,}/月")
        
        print("\n  【全店舗ランキング】")
        for i, shop in enumerate(data['results'], 1):
            print(f"    {i}位: {shop['shop_name']} - ¥{shop['scout_income']:,}/月")
        
        print("✅ 正常シミュレーション完了\n")
    else:
        print(f"❌ エラー: {response.status_code} - {response.text}\n")
except Exception as e:
    print(f"❌ 接続エラー: {e}\n")

print("=== 全テスト完了 ===")
print("\n注意: ローカル環境でテストする場合は、バックエンドが起動していることを確認してください。")
print("コマンド: cd backend && uvicorn app.main:app --reload")
