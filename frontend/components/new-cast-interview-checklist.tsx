import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function NewCastInterviewChecklist() {
  return (
    <Card className="border-red-500/30 bg-red-500/5 p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5 text-red-400" />
          <h4 className="font-semibold text-red-300">✅ 新人面接チェックリスト</h4>
        </div>
        
        <p className="text-xs text-red-200/80">
          ※ 業界未経験の方への説明ポイント（その場のリマインド用・保存不要）
        </p>

        <div className="space-y-2 mt-3">
          {[
            '業界の基本ルールを説明した',
            '給与体系（時給・バック率）を説明した',
            '勤務時間・シフトの柔軟性を説明した',
            '服装・身だしなみの基準を案内した',
            '不安・質問に丁寧に回答した',
            '体入日程を具体的に提案した',
          ].map((item, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-2 rounded hover:bg-red-500/10 transition-colors cursor-pointer group"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-red-500/50 bg-slate-800 text-red-400 focus:ring-2 focus:ring-red-500/30 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-red-100 group-hover:text-white transition-colors">
                {item}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-200 leading-relaxed">
            💡 <span className="font-medium">新人対応のコツ:</span> 業界用語を避け、具体例を交えて丁寧に説明しましょう。
            「体入」「同伴」「アフター」などの言葉は最初から使わず、本人が理解してから使うことを推奨します。
          </p>
        </div>
      </div>
    </Card>
  );
}
