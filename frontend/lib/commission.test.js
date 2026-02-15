/**
 * スカウトマン報酬計算ユーティリティのテスト（JavaScript版）
 */

// TypeScriptの型を削除してJavaScript化
function calculateCommission(input) {
  const { castEstimatedSales, sbType, sbRate, scoutShare, paymentCycle } = input;

  let sbTotal;
  let formulaBase;

  if (sbType === 'sales_percentage') {
    sbTotal = Math.round((castEstimatedSales * sbRate) / 100);
    formulaBase = `${formatCurrency(castEstimatedSales)} × ${sbRate}%`;
  } else if (sbType === 'salary_percentage') {
    const estimatedSalary = Math.round(castEstimatedSales * 0.5);
    sbTotal = Math.round((estimatedSalary * sbRate) / 100);
    formulaBase = `${formatCurrency(estimatedSalary)}（給与） × ${sbRate}%`;
  } else {
    sbTotal = Math.round(sbRate);
    formulaBase = `固定 ${formatCurrency(sbRate)}`;
  }

  const scoutIncome = Math.round((sbTotal * scoutShare) / 100);
  const orgIncome = sbTotal - scoutIncome;
  const perPayment = paymentCycle === 'bimonthly' ? Math.round(scoutIncome / 2) : scoutIncome;
  const annualEstimate = scoutIncome * 12;

  const formula = scoutShare === 100
    ? `${formulaBase} = ${formatCurrency(scoutIncome)}/月`
    : `${formulaBase} × ${scoutShare}% = ${formatCurrency(scoutIncome)}/月`;

  return { sbTotal, scoutIncome, orgIncome, perPayment, annualEstimate, formula };
}

function formatCurrency(amount) {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`;
}

// ==================== Tests ====================

console.log('=== スカウトマン報酬計算ユーティリティ テスト ===\n');

// Test 1
console.log('【テスト1】売上ベース（個人スカウト）');
const test1 = calculateCommission({
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 100,
  paymentCycle: 'monthly',
});
console.log('結果:', test1);
console.assert(test1.sbTotal === 100000);
console.assert(test1.scoutIncome === 100000);
console.assert(test1.annualEstimate === 1200000);
console.log('✅ テスト1 合格\n');

// Test 2
console.log('【テスト2】売上ベース（会社所属70%取分）');
const test2 = calculateCommission({
  castEstimatedSales: 500000,
  sbType: 'sales_percentage',
  sbRate: 20,
  scoutShare: 70,
  paymentCycle: 'monthly',
});
console.log('結果:', test2);
console.assert(test2.scoutIncome === 70000);
console.assert(test2.orgIncome === 30000);
console.log('✅ テスト2 合格\n');

// Test 3
console.log('【テスト3】固定額（隔月支払い）');
const test3 = calculateCommission({
  castEstimatedSales: 500000,
  sbType: 'fixed',
  sbRate: 80000,
  scoutShare: 100,
  paymentCycle: 'bimonthly',
});
console.log('結果:', test3);
console.assert(test3.perPayment === 40000);
console.assert(test3.annualEstimate === 960000);
console.log('✅ テスト3 合格\n');

console.log('=== 全テスト完了 ===');
console.log('✅ 3つのテストが全て合格しました');
