import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ConversionCardProps {
  id: number;
  applicantName: string;
  applicantAge?: number;
  linkType: 'recruit' | 'app_invite';
  shopName?: string;
  status: string;
  createdAt: string;
  sbAmount?: number;
  sbPaid?: boolean;
  memo?: string;
  timeline?: Array<{ status: string; timestamp: string }>;
  showScoutName?: boolean;
  scoutName?: string;
  onStatusUpdate?: (conversionId: number, currentStatus: string) => void;
  onMemoEdit?: (conversionId: number, memo: string) => void;
  onSbPay?: (conversionId: number) => void;
  onSbAdjust?: (conversionId: number, amount: number) => void;
  isMaster?: boolean;
}

export function ConversionCard({
  id,
  applicantName,
  applicantAge,
  linkType,
  shopName,
  status,
  createdAt,
  sbAmount,
  sbPaid,
  memo,
  timeline,
  showScoutName,
  scoutName,
  onStatusUpdate,
  onMemoEdit,
  onSbPay,
  onSbAdjust,
  isMaster = false,
}: ConversionCardProps) {
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-slate-500/20 text-slate-400 border-slate-500',
      contacted: 'bg-blue-500/20 text-blue-400 border-blue-500',
      interviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      trial: 'bg-orange-500/20 text-orange-400 border-orange-500',
      hired: 'bg-green-500/20 text-green-400 border-green-500',
      active: 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]',
      churned: 'bg-red-500/20 text-red-400 border-red-500',
      rejected: 'bg-gray-500/20 text-gray-400 border-gray-500',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: '応募',
      contacted: '連絡済み',
      interviewed: '面接',
      trial: '体入',
      hired: '採用',
      active: '稼働中',
      churned: '離脱',
      rejected: '不採用',
    };
    return labels[status] || status;
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      submitted: 'contacted',
      contacted: 'interviewed',
      interviewed: 'trial',
      trial: 'hired',
      hired: 'active',
    };
    return flow[current] || null;
  };

  const nextStatus = getNextStatus(status);

  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
      <div className="space-y-3">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {linkType === 'recruit' ? '🌙' : '💎'}
            <span className="text-white font-bold">
              {applicantName}
              {applicantAge && `（${applicantAge}歳）`}
            </span>
            {status === 'submitted' && <Badge variant="outline">🆕</Badge>}
          </div>
          <Badge variant="outline" className={getStatusBadgeColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        </div>

        {/* 詳細情報 */}
        <div className="space-y-1 text-sm text-slate-400">
          {showScoutName && scoutName && <p>担当: {scoutName}</p>}
          {shopName && <p>店舗: {shopName}</p>}
          {timeline && timeline.length > 0 && (
            <p className="text-xs">
              {timeline.map((t, idx) => (
                <span key={idx}>
                  {idx > 0 && ' → '}
                  {getStatusLabel(t.status)}:
                  {new Date(t.timestamp).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })}
                </span>
              ))}
            </p>
          )}
          {!timeline && (
            <p className="text-xs text-slate-500">
              {new Date(createdAt).toLocaleDateString('ja-JP')}
            </p>
          )}
          {memo && <p className="text-xs bg-slate-800 p-2 rounded">メモ: {memo}</p>}
        </div>

        {/* SB情報 */}
        {sbAmount && sbAmount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]">
              SB: ¥{sbAmount.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="bg-slate-700 text-slate-300">
              手取り: ¥{Math.floor(sbAmount * 0.7).toLocaleString()}
            </Badge>
            {sbPaid !== undefined && (
              sbPaid ? (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                  🟢 支払済
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500 animate-pulse">
                  🔴 未払
                </Badge>
              )
            )}
          </div>
        )}

        {/* アクション */}
        <div className="flex flex-wrap gap-2">
          {nextStatus && onStatusUpdate && (
            <Button size="sm" onClick={() => onStatusUpdate(id, status)}>
              {getStatusLabel(nextStatus)}に進める ▶
            </Button>
          )}
          {onMemoEdit && (
            <Button size="sm" variant="outline" onClick={() => onMemoEdit(id, memo || '')}>
              ✏️ メモ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
