import { Badge } from '@/components/ui/badge';

export type CastCategory = 'new' | 'experience' | 'active' | 'returner';

interface CastCategoryBadgeProps {
  category: CastCategory;
  className?: string;
}

const CATEGORY_CONFIG = {
  new: {
    label: '🆕 新人',
    color: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
  experience: {
    label: '👩 経験あり',
    color: 'bg-[#00C4CC]/10 text-[#00C4CC] border-[#00C4CC]/30',
  },
  active: {
    label: '🟢 稼働中',
    color: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
  returner: {
    label: '🔄 復帰',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
} as const;

export function CastCategoryBadge({ category, className = '' }: CastCategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category];
  
  return (
    <Badge variant="outline" className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}

export function getCategoryBorderColor(category: CastCategory): string {
  const colors = {
    new: '#FF6B6B',
    experience: '#00C4CC',
    active: '#22C55E',
    returner: '#F59E0B',
  };
  return colors[category];
}

export function getCategoryBackgroundColor(category: CastCategory): string {
  const colors = {
    new: 'rgba(255, 107, 107, 0.08)',
    experience: 'rgba(0, 196, 204, 0.05)',
    active: 'rgba(34, 197, 94, 0.05)',
    returner: 'rgba(245, 158, 11, 0.05)',
  };
  return colors[category];
}
