'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Plus, Trash2, TrendingUp } from 'lucide-react';
import { calculateSalary, calculateRankBonus, type WorkRecord } from '@/lib/salary-calculator';

interface SalaryCalculatorWidgetProps {
  onCalculated?: (data: {
    baseAmount: number;
    bonusAmount: number;
    totalAmount: number;
  }) => void;
}

export function SalaryCalculatorWidget({ onCalculated }: SalaryCalculatorWidgetProps) {
  const [records, setRecords] = useState<WorkRecord[]>([
    { date: '', hours: 0, hourlyRate: 0, bonus: 0 },
  ]);
  const [rank, setRank] = useState('Regular');

  const addRecord = () => {
    setRecords([...records, { date: '', hours: 0, hourlyRate: 0, bonus: 0 }]);
  };

  const removeRecord = (index: number) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const updateRecord = (index: number, field: keyof WorkRecord, value: string | number) => {
    const newRecords = [...records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setRecords(newRecords);
  };

  const calculate = () => {
    const salary = calculateSalary(records);
    const rankBonus = calculateRankBonus(salary.baseAmount, rank);
    const totalWithRankBonus = salary.totalAmount + rankBonus;

    if (onCalculated) {
      onCalculated({
        baseAmount: salary.baseAmount,
        bonusAmount: salary.bonusAmount + rankBonus,
        totalAmount: totalWithRankBonus,
      });
    }

    return {
      ...salary,
      rankBonus,
      totalWithRankBonus,
    };
  };

  const result = calculate();

  return (
    <Card className="border-slate-800 bg-slate-900/50 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" style={{ color: '#00C4CC' }} />
          <h3 className="text-lg font-semibold">給料自動計算</h3>
        </div>

        <Separator className="bg-slate-800" />

        {/* ランク選択 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">スカウトランク</label>
          <div className="flex flex-wrap gap-2">
            {['GOAT', 'Charisma', 'Elite', 'Pro', 'Regular'].map((r) => (
              <Button
                key={r}
                variant={rank === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRank(r)}
                className={rank === r ? 'text-white' : 'border-slate-700'}
                style={rank === r ? { backgroundColor: '#00C4CC' } : undefined}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-800" />

        {/* 勤務記録入力 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">勤務記録</label>
            <Button
              variant="outline"
              size="sm"
              onClick={addRecord}
              className="border-slate-700"
            >
              <Plus className="mr-1 h-3 w-3" />
              追加
            </Button>
          </div>

          {records.map((record, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-slate-800 bg-slate-800/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">勤務日 {index + 1}</span>
                {records.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecord(index)}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">日付</label>
                  <Input
                    type="date"
                    value={record.date}
                    onChange={(e) => updateRecord(index, 'date', e.target.value)}
                    className="h-8 bg-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">勤務時間</label>
                  <Input
                    type="number"
                    placeholder="8"
                    value={record.hours || ''}
                    onChange={(e) => updateRecord(index, 'hours', parseFloat(e.target.value) || 0)}
                    className="h-8 bg-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">時給 (¥)</label>
                  <Input
                    type="number"
                    placeholder="3000"
                    value={record.hourlyRate || ''}
                    onChange={(e) => updateRecord(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                    className="h-8 bg-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">ボーナス (¥)</label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={record.bonus || ''}
                    onChange={(e) => updateRecord(index, 'bonus', parseFloat(e.target.value) || 0)}
                    className="h-8 bg-slate-900 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-slate-800" />

        {/* 計算結果 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: '#00C4CC' }} />
            <h4 className="text-sm font-semibold">計算結果</h4>
          </div>

          <div className="space-y-2 rounded-lg bg-slate-800/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">基本報酬</span>
              <span className="font-medium">¥{result.baseAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">ボーナス</span>
              <span className="font-medium">¥{result.bonusAmount.toLocaleString()}</span>
            </div>
            {result.rankBonus > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ランクボーナス ({rank})</span>
                <span className="font-medium text-green-400">+¥{result.rankBonus.toLocaleString()}</span>
              </div>
            )}
            <Separator className="bg-slate-700" />
            <div className="flex justify-between">
              <span className="font-semibold">合計金額</span>
              <span className="text-xl font-bold" style={{ color: '#00C4CC' }}>
                ¥{result.totalWithRankBonus.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-800/30 p-2">
              <p className="text-xs text-slate-400">勤務日数</p>
              <p className="text-lg font-bold">{result.workDays}日</p>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2">
              <p className="text-xs text-slate-400">総勤務時間</p>
              <p className="text-lg font-bold">{result.totalHours}時間</p>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-2">
              <p className="text-xs text-slate-400">平均時給</p>
              <p className="text-lg font-bold">¥{result.averageHourlyRate.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
