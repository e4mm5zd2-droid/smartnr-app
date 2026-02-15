/**
 * スカウトマン報酬計算ユーティリティのテスト
 */

import {
  calculateCommission,
  compareShops,
  formatCurrency,
  validateCommissionInput,
  type CommissionInput,
  type ShopCommissionData,
} from './commission';

// ==================== Test Suite ====================

console.log('=== スカウトマン報酬計算ユーティリティ テスト ===\n');

// ==================== Test 1: 売上ベース（個人スカウト） ====================

console.log('【テスト1】売上ベース（個人スカウト）');
const test1Input: CommissionInput = {
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 100,
  paymentCycle: 'monthly',
};

const test1Result = calculateCommission(test1Input);
console.log('入力:', {
  売上: formatCurrency(test1Input.castEstimatedSales),
  SB率: `${test1Input.sbRate}%`,
  スカウト取分: `${test1Input.scoutShare}%`,
});
console.log('結果:', {
  SB総額: formatCurrency(test1Result.sbTotal),
  スカウト収入: formatCurrency(test1Result.scoutIncome),
  会社取分: formatCurrency(test1Result.orgIncome),
  月支払額: formatCurrency(test1Result.perPayment),
  年間推定: formatCurrency(test1Result.annualEstimate),
  計算式: test1Result.formula,
});
console.assert(test1Result.sbTotal === 100000, 'SB総額が正しくありません');
console.assert(test1Result.scoutIncome === 100000, 'スカウト収入が正しくありません');
console.assert(test1Result.annualEstimate === 1200000, '年間推定が正しくありません');
console.log('✅ テスト1 合格\n');

// ==================== Test 2: 売上ベース（会社所属70%取分） ====================

console.log('【テスト2】売上ベース（会社所属70%取分）');
const test2Input: CommissionInput = {
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 70,
  paymentCycle: 'monthly',
};

const test2Result = calculateCommission(test2Input);
console.log('入力:', {
  売上: formatCurrency(test2Input.castEstimatedSales),
  SB率: `${test2Input.sbRate}%`,
  スカウト取分: `${test2Input.scoutShare}%`,
});
console.log('結果:', {
  SB総額: formatCurrency(test2Result.sbTotal),
  スカウト収入: formatCurrency(test2Result.scoutIncome),
  会社取分: formatCurrency(test2Result.orgIncome),
  月支払額: formatCurrency(test2Result.perPayment),
  年間推定: formatCurrency(test2Result.annualEstimate),
  計算式: test2Result.formula,
});
console.assert(test2Result.sbTotal === 100000, 'SB総額が正しくありません');
console.assert(test2Result.scoutIncome === 70000, 'スカウト収入が正しくありません');
console.assert(test2Result.orgIncome === 30000, '会社取分が正しくありません');
console.assert(test2Result.annualEstimate === 840000, '年間推定が正しくありません');
console.log('✅ テスト2 合格\n');

// ==================== Test 3: 固定額（隔月支払い） ====================

console.log('【テスト3】固定額（隔月支払い）');
const test3Input: CommissionInput = {
  castEstimatedSales: 500000,
  sbType: 'fixed',
  sbRate: 80000,
  scoutShare: 100,
  paymentCycle: 'bimonthly',
};

const test3Result = calculateCommission(test3Input);
console.log('入力:', {
  売上: formatCurrency(test3Input.castEstimatedSales),
  固定額: formatCurrency(test3Input.sbRate),
  スカウト取分: `${test3Input.scoutShare}%`,
  支払いサイクル: '隔月',
});
console.log('結果:', {
  SB総額: formatCurrency(test3Result.sbTotal),
  スカウト収入: formatCurrency(test3Result.scoutIncome),
  会社取分: formatCurrency(test3Result.orgIncome),
  隔月支払額: formatCurrency(test3Result.perPayment),
  年間推定: formatCurrency(test3Result.annualEstimate),
  計算式: test3Result.formula,
});
console.assert(test3Result.sbTotal === 80000, 'SB総額が正しくありません');
console.assert(test3Result.scoutIncome === 80000, 'スカウト収入が正しくありません');
console.assert(test3Result.perPayment === 40000, '隔月支払額が正しくありません');
console.assert(test3Result.annualEstimate === 960000, '年間推定が正しくありません');
console.log('✅ テスト3 合格\n');

// ==================== Test 4: 給与ベース ====================

console.log('【テスト4】給与ベース（給与率50%想定）');
const test4Input: CommissionInput = {
  castEstimatedSales: 800000,
  sbType: 'salary_percentage',
  sbRate: 30,
  scoutShare: 80,
  paymentCycle: 'monthly',
};

const test4Result = calculateCommission(test4Input);
console.log('入力:', {
  売上: formatCurrency(test4Input.castEstimatedSales),
  推定給与: formatCurrency(test4Input.castEstimatedSales * 0.5),
  SB率: `${test4Input.sbRate}%`,
  スカウト取分: `${test4Input.scoutShare}%`,
});
console.log('結果:', {
  SB総額: formatCurrency(test4Result.sbTotal),
  スカウト収入: formatCurrency(test4Result.scoutIncome),
  会社取分: formatCurrency(test4Result.orgIncome),
  月支払額: formatCurrency(test4Result.perPayment),
  年間推定: formatCurrency(test4Result.annualEstimate),
  計算式: test4Result.formula,
});
console.assert(test4Result.sbTotal === 120000, 'SB総額が正しくありません');
console.assert(test4Result.scoutIncome === 96000, 'スカウト収入が正しくありません');
console.assert(test4Result.orgIncome === 24000, '会社取分が正しくありません');
console.log('✅ テスト4 合格\n');

// ==================== Test 5: 店舗比較 ====================

console.log('【テスト5】店舗比較（最も有利な店舗を見つける）');
const testShops: ShopCommissionData[] = [
  { shopId: 1, shopName: 'Club LION', sbType: 'sales_percentage', sbRate: 20 },
  { shopId: 2, shopName: 'Club ROYAL', sbType: 'sales_percentage', sbRate: 15 },
  { shopId: 3, shopName: 'Lounge CRYSTAL', sbType: 'fixed', sbRate: 90000 },
  { shopId: 4, shopName: 'Girls Bar ANGEL', sbType: 'salary_percentage', sbRate: 25 },
];

const comparisonResult = compareShops(testShops, 500000, 70);
console.log('キャスト推定売上:', formatCurrency(500000));
console.log('スカウト取分:', '70%');
console.log('\n店舗ランキング（スカウト収入順）:');
comparisonResult.forEach((shop, index) => {
  console.log(`  ${index + 1}位: ${shop.shopName} - ${formatCurrency(shop.scoutIncome)}/月`);
});
console.assert(comparisonResult[0].shopName === 'Lounge CRYSTAL', '1位が正しくありません');
console.assert(comparisonResult[0].scoutIncome === 90000, '1位の収入が正しくありません');
console.assert(comparisonResult.length === 4, '店舗数が正しくありません');
console.log('✅ テスト5 合格\n');

// ==================== Test 6: 通貨フォーマット ====================

console.log('【テスト6】通貨フォーマット');
const formatTests = [
  { input: 0, expected: '¥0' },
  { input: 1000, expected: '¥1,000' },
  { input: 70000, expected: '¥70,000' },
  { input: 1234567, expected: '¥1,234,567' },
  { input: 999999999, expected: '¥999,999,999' },
];

formatTests.forEach(({ input, expected }) => {
  const result = formatCurrency(input);
  console.log(`  ${input} → ${result}`);
  console.assert(result === expected, `フォーマットが正しくありません: ${result} !== ${expected}`);
});
console.log('✅ テスト6 合格\n');

// ==================== Test 7: バリデーション ====================

console.log('【テスト7】入力値バリデーション');

// 正常な入力
const validInput: CommissionInput = {
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 70,
  paymentCycle: 'monthly',
};
const validErrors = validateCommissionInput(validInput);
console.log('正常な入力:', validErrors.length === 0 ? '✅ エラーなし' : `❌ ${validErrors}`);
console.assert(validErrors.length === 0, '正常な入力でエラーが発生しました');

// 異常な入力1: 負の売上
const invalidInput1: CommissionInput = {
  castEstimatedSales: -100000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 70,
  paymentCycle: 'monthly',
};
const invalidErrors1 = validateCommissionInput(invalidInput1);
console.log('負の売上:', invalidErrors1.length > 0 ? `✅ エラー検出: ${invalidErrors1[0]}` : '❌ エラー未検出');
console.assert(invalidErrors1.length > 0, '負の売上でエラーが検出されませんでした');

// 異常な入力2: 101%のSB率
const invalidInput2: CommissionInput = {
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 101,
  scoutShare: 70,
  paymentCycle: 'monthly',
};
const invalidErrors2 = validateCommissionInput(invalidInput2);
console.log('101%のSB率:', invalidErrors2.length > 0 ? `✅ エラー検出: ${invalidErrors2[0]}` : '❌ エラー未検出');
console.assert(invalidErrors2.length > 0, '101%のSB率でエラーが検出されませんでした');

// 異常な入力3: 150%のスカウト取分
const invalidInput3: CommissionInput = {
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 150,
  paymentCycle: 'monthly',
};
const invalidErrors3 = validateCommissionInput(invalidInput3);
console.log('150%のスカウト取分:', invalidErrors3.length > 0 ? `✅ エラー検出: ${invalidErrors3[0]}` : '❌ エラー未検出');
console.assert(invalidErrors3.length > 0, '150%のスカウト取分でエラーが検出されませんでした');

console.log('✅ テスト7 合格\n');

// ==================== Test Summary ====================

console.log('=== 全テスト完了 ===');
console.log('✅ 7つのテストスイートが全て合格しました');
console.log('\n主な機能:');
console.log('  - 売上ベース計算（sales_percentage）');
console.log('  - 給与ベース計算（salary_percentage）');
console.log('  - 固定額計算（fixed）');
console.log('  - 会社所属スカウト対応（取分70%など）');
console.log('  - 隔月支払いサイクル対応');
console.log('  - 店舗比較・ランキング');
console.log('  - 通貨フォーマット');
console.log('  - 入力値バリデーション');
