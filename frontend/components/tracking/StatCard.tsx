interface StatCardProps {
  title: string;
  value: string | number;
  accent?: string;
}

export function StatCard({ title, value, accent }: StatCardProps) {
  return (
    <div className="rounded-xl p-4 backdrop-blur-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
      <p className="text-xs text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold" style={{ color: accent || '#FFFFFF' }}>
        {value}
      </p>
    </div>
  );
}
