'use client';

import { Bell, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'warning';
}

const mockNotifications: Notification[] = [];

export function NotificationsPopover() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-zinc-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-zinc-800 bg-zinc-900 p-0" align="end">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <h3 className="font-semibold text-white">通知</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-zinc-400 hover:text-white"
              onClick={() => {
                // すべて既読にする（モックデータの場合は状態更新のみ）
                console.log('すべて既読');
              }}
            >
              すべて既読
            </Button>
          </div>
        </div>

        {/* 通知リスト */}
        <ScrollArea className="h-[400px]">
          {mockNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-sm text-zinc-400">通知はありません</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-zinc-800/50 ${
                    !notification.read ? 'bg-zinc-800/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: notification.type === 'success'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : notification.type === 'warning'
                          ? 'rgba(234, 179, 8, 0.2)'
                          : 'rgba(0, 196, 204, 0.2)',
                      }}
                    >
                      <Check className={`h-4 w-4 ${
                        notification.type === 'success'
                          ? 'text-green-400'
                          : notification.type === 'warning'
                          ? 'text-yellow-400'
                          : 'text-zinc-400'
                      }`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div 
                            className="mt-1 h-2 w-2 rounded-full bg-white"
                          />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-zinc-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* フッター */}
        <div className="border-t border-zinc-800 p-2">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-xs text-zinc-400 hover:text-white"
            onClick={() => {
              // /notifications に遷移
              window.location.href = '/notifications';
            }}
          >
            すべての通知を見る
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
