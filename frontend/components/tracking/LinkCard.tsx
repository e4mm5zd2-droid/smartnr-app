import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, QrCode } from 'lucide-react';
import { useState } from 'react';

interface LinkCardProps {
  id: number;
  uniqueCode: string;
  linkType: 'recruit' | 'app_invite';
  shopName?: string;
  clicks: number;
  submissions: number;
  cvr?: number;
  createdAt?: string;
  isActive: boolean;
  forceDisabled: boolean;
  onToggle?: (linkId: number) => void;
  onCopyUrl?: (linkId: number, url: string) => void;
  onShowQr?: (linkId: number) => void;
  isMaster?: boolean;
}

export function LinkCard({
  id,
  uniqueCode,
  linkType,
  shopName,
  clicks,
  submissions,
  cvr,
  createdAt,
  isActive,
  forceDisabled,
  onToggle,
  onCopyUrl,
  onShowQr,
  isMaster = false,
}: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const url = `https://smartnr-app.onrender.com/r/${uniqueCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (onCopyUrl) onCopyUrl(id, url);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculatedCvr = clicks > 0 ? ((submissions / clicks) * 100).toFixed(1) : '0.0';

  return (
    <div
      className="p-4 rounded-lg border border-slate-700 bg-slate-800/50"
      style={forceDisabled ? { opacity: 0.5 } : undefined}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {linkType === 'recruit' ? '🌙' : '💎'}
            <span className="font-mono text-sm text-slate-300">{uniqueCode}</span>
            {forceDisabled ? (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
                🔴 管理者により停止中
              </Badge>
            ) : !isActive ? (
              <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500">
                ⏸ 停止中
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
                🟢 有効
              </Badge>
            )}
          </div>
        </div>

        {shopName && <p className="text-sm text-slate-400">→ {shopName}</p>}

        <div className="text-sm text-slate-400">
          クリック: {clicks} | {linkType === 'recruit' ? '応募' : '登録'}: {submissions}
          {cvr !== undefined && ` | CVR: ${cvr}%`}
          {cvr === undefined && ` | CVR: ${calculatedCvr}%`}
        </div>

        {createdAt && (
          <p className="text-xs text-slate-500">作成: {new Date(createdAt).toLocaleDateString('ja-JP')}</p>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            {copied ? '✅ コピーしました' : 'URL'}
          </Button>
          {onShowQr && (
            <Button size="sm" variant="outline" onClick={() => onShowQr(id)}>
              <QrCode className="h-4 w-4 mr-1" /> QR
            </Button>
          )}
          {onToggle && !forceDisabled && (
            <Button
              size="sm"
              variant="outline"
              className={
                isActive
                  ? 'bg-gray-500/20 text-gray-400 border-gray-500'
                  : 'bg-green-500/20 text-green-400 border-green-500'
              }
              onClick={() => onToggle(id)}
            >
              {isActive ? '⏸ 停止' : '▶ 再開'}
            </Button>
          )}
          {isMaster && onToggle && (
            <Button
              size="sm"
              variant="outline"
              className="bg-red-500/20 text-red-400 border-red-500"
              onClick={() => onToggle(id)}
            >
              🔴 強制停止
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
