'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  AlertCircle,
  ArrowLeft,
  Calculator,
} from 'lucide-react';
import Link from 'next/link';
import { SalaryCalculatorWidget } from '@/components/salary-calculator-widget';
import { CommissionSimulator } from '@/components/commission-simulator';

const steps = [
  { id: 1, name: 'キャスト選択', description: '申請対象を選択' },
  { id: 2, name: '店舗情報', description: '勤務先と期間入力' },
  { id: 3, name: '金額入力', description: '報酬額と内訳入力' },
  { id: 4, name: '確認・送信', description: '内容確認して送信' },
];

export default function SalaryRequestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    castId: '',
    castName: '',
    shopId: '',
    shopName: '',
    workPeriod: '',
    baseAmount: '',
    bonusAmount: '',
    totalAmount: '',
    note: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('給料申請データ:', formData);
    alert('給料申請が送信されました!');
    // TODO: API送信処理
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* 戻るリンク */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">ダッシュボードに戻る</span>
      </Link>

      {/* ヘッダー */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4 h-12 w-12 rounded-full" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold">給料申請 & 報酬シミュレーション</h1>
        <p className="mt-2 text-sm text-slate-400">
          スカウト報酬の申請と収入シミュレーション
        </p>
      </div>

      {/* 報酬シミュレーター */}
      <CommissionSimulator />

      <Separator className="bg-slate-800" />

      {/* 給料申請フォーム */}
      <div className="text-center pt-6">
        <h2 className="text-2xl font-bold mb-2">給料申請フォーム</h2>
        <p className="text-sm text-slate-400">
          実際の給料申請はこちらから
        </p>
      </div>

      {/* ステップインジケーター */}
      <Card className="border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    currentStep > step.id
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : currentStep === step.id
                      ? 'text-slate-100'
                      : 'border-slate-700 bg-slate-800 text-slate-500'
                  }`}
                  style={currentStep === step.id ? { borderColor: '#00C4CC', backgroundColor: 'rgba(0, 196, 204, 0.2)' } : undefined}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full transition-colors ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* フォーム */}
      <Card className="border-slate-800 bg-slate-900/50 p-6">
        {/* Step 1: キャスト選択 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">キャスト選択</h2>
            <Separator className="bg-slate-800" />
            <div className="space-y-3">
              <label className="block text-sm font-medium">キャストを選択</label>
              <Select
                value={formData.castId}
                onValueChange={(value) => {
                  const castNames: Record<string, string> = {
                    '1': 'あやか',
                    '2': 'みゆき',
                    '3': 'さくら',
                  };
                  setFormData({ ...formData, castId: value, castName: castNames[value] || '' });
                }}
              >
                <SelectTrigger className="bg-slate-800">
                  <SelectValue placeholder="キャストを選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">あやか（23歳）</SelectItem>
                  <SelectItem value="2">みゆき（21歳）</SelectItem>
                  <SelectItem value="3">さくら（25歳）</SelectItem>
                </SelectContent>
              </Select>
              {formData.castId && (
                <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-300">選択中</p>
                      <p className="text-sm text-slate-300 mt-1">
                        {formData.castName}さんの給料申請を作成します
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: 店舗情報 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">店舗情報</h2>
            <Separator className="bg-slate-800" />
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">勤務店舗</label>
                <Select
                  value={formData.shopId}
                  onValueChange={(value) => {
                    const shopNames: Record<string, string> = {
                      '1': 'Club LION',
                      '2': 'PLATINUM',
                      '3': 'GALAXY',
                    };
                    setFormData({ ...formData, shopId: value, shopName: shopNames[value] || '' });
                  }}
                >
                  <SelectTrigger className="bg-slate-800">
                    <SelectValue placeholder="店舗を選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Club LION（祇園）</SelectItem>
                    <SelectItem value="2">PLATINUM（木屋町）</SelectItem>
                    <SelectItem value="3">GALAXY（先斗町）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">勤務期間</label>
                <Input
                  type="text"
                  placeholder="例: 2026年1月1日〜1月31日"
                  value={formData.workPeriod}
                  onChange={(e) => setFormData({ ...formData, workPeriod: e.target.value })}
                  className="bg-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 金額入力 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">報酬額入力</h2>
            <Separator className="bg-slate-800" />
            
            {/* 自動計算ウィジェット */}
            <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4" style={{ color: '#00C4CC' }} />
                <p className="text-sm font-medium">自動計算を使用</p>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                勤務記録から自動的に報酬を計算できます。
              </p>
              <SalaryCalculatorWidget
                onCalculated={(data) => {
                  setFormData({
                    ...formData,
                    baseAmount: data.baseAmount.toString(),
                    bonusAmount: data.bonusAmount.toString(),
                    totalAmount: data.totalAmount.toString(),
                  });
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Separator className="flex-1 bg-slate-800" />
              <span className="text-xs text-slate-500">または手動入力</span>
              <Separator className="flex-1 bg-slate-800" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">基本報酬</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.baseAmount}
                  onChange={(e) => {
                    const base = parseFloat(e.target.value) || 0;
                    const bonus = parseFloat(formData.bonusAmount) || 0;
                    setFormData({
                      ...formData,
                      baseAmount: e.target.value,
                      totalAmount: (base + bonus).toString(),
                    });
                  }}
                  className="bg-slate-800"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">ボーナス</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={formData.bonusAmount}
                  onChange={(e) => {
                    const base = parseFloat(formData.baseAmount) || 0;
                    const bonus = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      bonusAmount: e.target.value,
                      totalAmount: (base + bonus).toString(),
                    });
                  }}
                  className="bg-slate-800"
                />
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(0, 196, 204, 0.1) 0%, rgba(51, 212, 219, 0.1) 100%)', border: '1px solid rgba(0, 196, 204, 0.3)' }}>
                <span className="text-lg font-semibold">合計金額</span>
                <span className="text-2xl font-bold" style={{ color: '#00C4CC' }}>
                  ¥{formData.totalAmount || '0'}
                </span>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">備考（任意）</label>
                <textarea
                  rows={3}
                  placeholder="追加情報があれば記入してください"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm border border-slate-700 focus:outline-none focus-visible:border-[#00C4CC]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 確認 */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">申請内容の確認</h2>
            <Separator className="bg-slate-800" />
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-slate-400">キャスト</span>
                <span className="font-medium">{formData.castName}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex justify-between py-2">
                <span className="text-slate-400">勤務店舗</span>
                <span className="font-medium">{formData.shopName}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex justify-between py-2">
                <span className="text-slate-400">勤務期間</span>
                <span className="font-medium">{formData.workPeriod}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex justify-between py-2">
                <span className="text-slate-400">基本報酬</span>
                <span className="font-medium">¥{formData.baseAmount}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex justify-between py-2">
                <span className="text-slate-400">ボーナス</span>
                <span className="font-medium">¥{formData.bonusAmount}</span>
              </div>
              <Separator className="bg-slate-800" />
              <div className="flex justify-between py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg px-4">
                <span className="text-lg font-semibold">合計金額</span>
                <span className="text-xl font-bold text-purple-400">¥{formData.totalAmount}</span>
              </div>
              {formData.note && (
                <>
                  <Separator className="bg-slate-800" />
                  <div className="py-2">
                    <span className="text-slate-400 block mb-1">備考</span>
                    <p className="text-sm">{formData.note}</p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">確認してください</p>
                  <p className="text-sm text-slate-300 mt-1">
                    送信後は修正できません。内容をよく確認してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="border-slate-700"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              className="text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #00A3AA 0%, #00C4CC 100%)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)')}
            >
              次へ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <FileText className="mr-2 h-4 w-4" />
            申請を送信
          </Button>
        )}
      </div>
    </div>
  );
}
