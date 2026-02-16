interface FunnelBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function FunnelBar({ label, value, max, color }: FunnelBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}80 0%, ${color} 100%)`,
          }}
        />
      </div>
    </div>
  );
}
