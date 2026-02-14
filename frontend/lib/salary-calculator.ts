// 給料計算ロジック

export interface WorkRecord {
  date: string;
  hours: number;
  hourlyRate: number;
  bonus: number;
}

export interface SalaryCalculation {
  baseAmount: number;
  bonusAmount: number;
  totalAmount: number;
  workDays: number;
  totalHours: number;
  averageHourlyRate: number;
}

/**
 * 勤務記録から給料を自動計算
 */
export function calculateSalary(records: WorkRecord[]): SalaryCalculation {
  if (records.length === 0) {
    return {
      baseAmount: 0,
      bonusAmount: 0,
      totalAmount: 0,
      workDays: 0,
      totalHours: 0,
      averageHourlyRate: 0,
    };
  }

  // 基本報酬計算（時給 × 勤務時間）
  const baseAmount = records.reduce((sum, record) => {
    return sum + record.hours * record.hourlyRate;
  }, 0);

  // ボーナス合計
  const bonusAmount = records.reduce((sum, record) => {
    return sum + record.bonus;
  }, 0);

  // 合計金額
  const totalAmount = baseAmount + bonusAmount;

  // 勤務日数
  const workDays = records.length;

  // 総勤務時間
  const totalHours = records.reduce((sum, record) => sum + record.hours, 0);

  // 平均時給
  const averageHourlyRate = totalHours > 0 ? baseAmount / totalHours : 0;

  return {
    baseAmount: Math.round(baseAmount),
    bonusAmount: Math.round(bonusAmount),
    totalAmount: Math.round(totalAmount),
    workDays,
    totalHours,
    averageHourlyRate: Math.round(averageHourlyRate),
  };
}

/**
 * 歩合制の計算（売上の一定割合）
 */
export function calculateCommission(
  sales: number,
  commissionRate: number
): number {
  return Math.round(sales * commissionRate);
}

/**
 * ランクボーナスの計算
 */
export function calculateRankBonus(
  baseAmount: number,
  rank: string
): number {
  const bonusRates: Record<string, number> = {
    GOAT: 0.3, // 30%ボーナス
    Charisma: 0.2, // 20%ボーナス
    Elite: 0.15, // 15%ボーナス
    Pro: 0.1, // 10%ボーナス
    Regular: 0.05, // 5%ボーナス
  };

  const rate = bonusRates[rank] || 0;
  return Math.round(baseAmount * rate);
}

/**
 * 成果ボーナスの計算（目標達成度に応じて）
 */
export function calculateAchievementBonus(
  actualCasts: number,
  targetCasts: number,
  bonusPerCast: number
): number {
  if (actualCasts < targetCasts) {
    return 0;
  }

  // 目標達成で基本ボーナス
  let bonus = bonusPerCast * targetCasts;

  // 超過分は1.5倍
  const excessCasts = actualCasts - targetCasts;
  if (excessCasts > 0) {
    bonus += bonusPerCast * excessCasts * 1.5;
  }

  return Math.round(bonus);
}

/**
 * 期間指定での勤務記録フィルタリング
 */
export function filterRecordsByPeriod(
  records: WorkRecord[],
  startDate: string,
  endDate: string
): WorkRecord[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return records.filter((record) => {
    const recordDate = new Date(record.date);
    return recordDate >= start && recordDate <= end;
  });
}

/**
 * 税金・控除の計算（簡易版）
 */
export interface TaxCalculation {
  grossAmount: number;
  incomeTax: number;
  residentTax: number;
  socialInsurance: number;
  netAmount: number;
}

export function calculateTaxes(grossAmount: number): TaxCalculation {
  // 簡易計算（実際の税率は異なる場合があります）
  const incomeTax = Math.round(grossAmount * 0.05); // 5%
  const residentTax = Math.round(grossAmount * 0.03); // 3%
  const socialInsurance = Math.round(grossAmount * 0.07); // 7%

  const netAmount = grossAmount - incomeTax - residentTax - socialInsurance;

  return {
    grossAmount,
    incomeTax,
    residentTax,
    socialInsurance,
    netAmount: Math.max(0, netAmount),
  };
}

/**
 * 給料明細の生成
 */
export interface PaySlip {
  scoutName: string;
  period: string;
  salary: SalaryCalculation;
  taxes: TaxCalculation;
  breakdown: {
    label: string;
    amount: number;
  }[];
  generatedAt: string;
}

export function generatePaySlip(
  scoutName: string,
  period: string,
  records: WorkRecord[],
  rank?: string
): PaySlip {
  const salary = calculateSalary(records);
  
  // ランクボーナスを追加
  let rankBonus = 0;
  if (rank) {
    rankBonus = calculateRankBonus(salary.baseAmount, rank);
  }

  const grossAmount = salary.totalAmount + rankBonus;
  const taxes = calculateTaxes(grossAmount);

  const breakdown = [
    { label: '基本報酬', amount: salary.baseAmount },
    { label: 'ボーナス', amount: salary.bonusAmount },
  ];

  if (rankBonus > 0) {
    breakdown.push({ label: `ランクボーナス (${rank})`, amount: rankBonus });
  }

  breakdown.push(
    { label: '総支給額', amount: grossAmount },
    { label: '所得税', amount: -taxes.incomeTax },
    { label: '住民税', amount: -taxes.residentTax },
    { label: '社会保険料', amount: -taxes.socialInsurance },
    { label: '手取り額', amount: taxes.netAmount }
  );

  return {
    scoutName,
    period,
    salary: {
      ...salary,
      totalAmount: grossAmount,
      bonusAmount: salary.bonusAmount + rankBonus,
    },
    taxes,
    breakdown,
    generatedAt: new Date().toISOString(),
  };
}
