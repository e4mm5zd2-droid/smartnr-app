/**
 * スカウトマン報酬計算ユーティリティ
 * 
 * ナイトワーク業界のSB（スカウトマンボーナス）計算を行う。
 * 浮動小数点誤差を防ぐため、全て整数演算を使用。
 */

// ==================== Types ====================

export interface CommissionInput {
  castEstimatedSales: number;  // キャスト推定月間売上（円）
  sbType: 'sales_percentage' | 'salary_percentage' | 'fixed';
  sbRate: number;              // SB率（%）or 固定額（円）
  scoutShare: number;          // スカウト取分（%）。個人なら100
  paymentCycle: 'monthly' | 'bimonthly';
}

export interface CommissionResult {
  sbTotal: number;         // SB総額（円）
  scoutIncome: number;     // スカウト取分（円）
  orgIncome: number;       // 会社取分（円）
  perPayment: number;      // 1回あたり支払額（円）
  annualEstimate: number;  // 年間推定収入（円）
  formula: string;         // 計算式（表示用）
}

export interface ShopCommissionData {
  shopId: number;
  shopName: string;
  sbType: 'sales_percentage' | 'salary_percentage' | 'fixed';
  sbRate: number;
}

export interface ShopComparisonResult {
  shopId: number;
  shopName: string;
  scoutIncome: number;
}

// ==================== Main Calculation ====================

/**
 * スカウトマン報酬を計算
 * 
 * @param input - 計算パラメータ
 * @returns 詳細な計算結果
 * 
 * @example
 * ```typescript
 * const result = calculateCommission({
 *   castEstimatedSales: 500000,
 *   sbType: 'sales_percentage',
 *   sbRate: 20,
 *   scoutShare: 70,
 *   paymentCycle: 'monthly'
 * });
 * console.log(result.scoutIncome); // 70000
 * ```
 */
export function calculateCommission(input: CommissionInput): CommissionResult {
  const { castEstimatedSales, sbType, sbRate, scoutShare, paymentCycle } = input;

  // 1. SB総額を計算
  let sbTotal: number;
  let formulaBase: string;

  if (sbType === 'sales_percentage') {
    // 売上ベース: sbTotal = sales × (sbRate / 100)
    sbTotal = Math.round((castEstimatedSales * sbRate) / 100);
    formulaBase = `${formatCurrency(castEstimatedSales)} × ${sbRate}%`;
  } else if (sbType === 'salary_percentage') {
    // 給与ベース（給与額は売上の50%と仮定）
    const estimatedSalary = Math.round(castEstimatedSales * 0.5);
    sbTotal = Math.round((estimatedSalary * sbRate) / 100);
    formulaBase = `${formatCurrency(estimatedSalary)}（給与） × ${sbRate}%`;
  } else {
    // 固定額
    sbTotal = Math.round(sbRate);
    formulaBase = `固定 ${formatCurrency(sbRate)}`;
  }

  // 2. スカウト取分を計算
  const scoutIncome = Math.round((sbTotal * scoutShare) / 100);
  const orgIncome = sbTotal - scoutIncome;

  // 3. 1回あたり支払額を計算
  const perPayment = paymentCycle === 'bimonthly' 
    ? Math.round(scoutIncome / 2) 
    : scoutIncome;

  // 4. 年間推定収入を計算
  const annualEstimate = scoutIncome * 12;

  // 5. 計算式を生成
  const formula = scoutShare === 100
    ? `${formulaBase} = ${formatCurrency(scoutIncome)}/月`
    : `${formulaBase} × ${scoutShare}% = ${formatCurrency(scoutIncome)}/月`;

  return {
    sbTotal,
    scoutIncome,
    orgIncome,
    perPayment,
    annualEstimate,
    formula,
  };
}

// ==================== Shop Comparison ====================

/**
 * 複数店舗のSB条件を比較し、スカウト収入順にソート
 * 
 * @param shops - 店舗のSB条件リスト
 * @param castEstimatedSales - キャスト推定月間売上（円）
 * @param scoutShare - スカウト取分（%）
 * @returns スカウト収入降順の店舗リスト
 * 
 * @example
 * ```typescript
 * const shops = [
 *   { shopId: 1, shopName: "Club A", sbType: "sales_percentage", sbRate: 20 },
 *   { shopId: 2, shopName: "Club B", sbType: "fixed", sbRate: 80000 },
 * ];
 * const results = compareShops(shops, 500000, 70);
 * console.log(results[0].shopName); // 最も収入が高い店舗
 * ```
 */
export function compareShops(
  shops: ShopCommissionData[],
  castEstimatedSales: number,
  scoutShare: number
): ShopComparisonResult[] {
  const results = shops.map(shop => {
    const result = calculateCommission({
      castEstimatedSales,
      sbType: shop.sbType,
      sbRate: shop.sbRate,
      scoutShare,
      paymentCycle: 'monthly', // 比較用は月次固定
    });

    return {
      shopId: shop.shopId,
      shopName: shop.shopName,
      scoutIncome: result.scoutIncome,
    };
  });

  // scoutIncome降順ソート
  return results.sort((a, b) => b.scoutIncome - a.scoutIncome);
}

// ==================== Currency Formatting ====================

/**
 * 金額を日本円フォーマットに変換
 * 
 * @param amount - 金額（円）
 * @returns フォーマット済み文字列（例: "¥70,000"）
 * 
 * @example
 * ```typescript
 * formatCurrency(70000);    // "¥70,000"
 * formatCurrency(1234567);  // "¥1,234,567"
 * formatCurrency(0);        // "¥0"
 * ```
 */
export function formatCurrency(amount: number): string {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
}

// ==================== Validation ====================

/**
 * 入力値の妥当性を検証
 * 
 * @param input - 計算パラメータ
 * @returns エラーメッセージ配列（空配列なら正常）
 */
export function validateCommissionInput(input: CommissionInput): string[] {
  const errors: string[] = [];

  if (input.castEstimatedSales < 0) {
    errors.push('売上額は0以上である必要があります');
  }

  if (input.sbRate < 0) {
    errors.push('SB率/固定額は0以上である必要があります');
  }

  if (input.sbType !== 'fixed' && input.sbRate > 100) {
    errors.push('SB率は100%以下である必要があります');
  }

  if (input.scoutShare < 0 || input.scoutShare > 100) {
    errors.push('スカウト取分は0〜100%である必要があります');
  }

  return errors;
}
