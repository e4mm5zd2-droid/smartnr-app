'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Store,
  DollarSign,
  MessageSquare,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { LogoutButton } from './logout-button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'ダッシュボード',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'キャスト一覧',
    href: '/casts',
    icon: Users,
  },
  {
    title: '新規登録',
    href: '/casts/new',
    icon: UserPlus,
  },
  {
    title: '店舗管理',
    href: '/stores',
    icon: Store,
  },
  {
    title: '面接スケジュール',
    href: '/schedule',
    icon: Calendar,
  },
  {
    title: '給料申請',
    href: '/salary',
    icon: DollarSign,
  },
  {
    title: 'AI Concierge',
    href: '/concierge',
    icon: MessageSquare,
  },
];

// ランクバッジのスタイリング関数
function getRankStyle(rank: string) {
  switch (rank) {
    case 'GOAT':
      return {
        bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        text: '#000000',
        border: '1px solid rgba(255, 215, 0, 0.5)',
        shadow: '0 0 10px rgba(255, 215, 0, 0.3)',
      };
    case 'Charisma':
      return {
        bg: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
        text: '#FFFFFF',
        border: '1px solid rgba(147, 51, 234, 0.5)',
        shadow: '0 0 8px rgba(147, 51, 234, 0.3)',
      };
    default:
      return {
        bg: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
        text: '#FFFFFF',
        border: '1px solid rgba(100, 116, 139, 0.5)',
        shadow: 'none',
      };
  }
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* ロゴ・ヘッダー */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: '#00C4CC' }}>
            <span className="text-lg font-bold text-white">SN</span>
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Smart</span>
            <span className="smartnr-logo-nr">NR</span>
          </span>
        </Link>
      </div>

      {/* ナビゲーション */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-slate-100'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
                style={isActive ? { backgroundColor: 'rgba(0, 196, 204, 0.15)' } : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: 'rgba(0, 196, 204, 0.2)', color: '#00C4CC' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* ユーザープロフィール */}
      <div className="p-4 space-y-2">
        <div className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-slate-800">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatar-placeholder.png" alt="京極 蓮" />
            <AvatarFallback style={{ backgroundColor: '#00C4CC' }} className="text-white">
              KR
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">京極 蓮</p>
              <Badge
                className="h-5 px-2 text-[10px] font-bold uppercase tracking-wide border"
                style={{
                  background: getRankStyle('GOAT').bg,
                  color: getRankStyle('GOAT').text,
                  border: getRankStyle('GOAT').border,
                  boxShadow: getRankStyle('GOAT').shadow,
                }}
              >
                GOAT
              </Badge>
            </div>
            <p className="text-xs text-slate-400">スカウト</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 border-r bg-slate-900/50 lg:block">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-slate-900 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
