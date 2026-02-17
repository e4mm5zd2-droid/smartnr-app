'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'ホーム',
    href: '/',
    icon: Home,
  },
  {
    label: 'キャスト',
    href: '/casts',
    icon: Users,
  },
  {
    label: '店舗',
    href: '/stores',
    icon: Building2,
  },
  {
    label: 'マイページ',
    href: '/mypage',
    icon: User,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-zinc-800/50 bg-zinc-950/90 backdrop-blur-md safe-area-bottom">
      <div className="flex h-full items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors touch-target relative"
            >
              <Icon className={cn('h-6 w-6', isActive ? 'text-white' : 'text-zinc-500')} />
              <span className={cn('text-xs font-medium', isActive ? 'text-white' : 'text-zinc-500')}>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
