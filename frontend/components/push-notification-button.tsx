'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function PushNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    }
  };

  const requestNotificationPermission = async () => {
    setLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToPush();
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID公開鍵（本番環境では環境変数から取得）
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        });

        // サーバーにサブスクリプションを送信
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });

        setIsSubscribed(true);
        
        // テスト通知を送信
        new Notification('SmartNR 通知が有効化されました！', {
          body: '重要な情報をリアルタイムでお知らせします',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        });
      } catch (error) {
        console.error('Failed to subscribe to push:', error);
      }
    }
  };

  const unsubscribeFromPush = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          
          // サーバーにサブスクリプション解除を通知
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Failed to unsubscribe from push:', error);
      }
    }
  };

  // SSR時はレンダリングしない
  if (!isMounted) {
    return null;
  }

  // 通知非対応ブラウザでは表示しない
  if (typeof window !== 'undefined' && !('Notification' in window)) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${
            isSubscribed
              ? 'border-green-500/50 bg-green-500/10 text-green-400'
              : 'border-slate-700'
          }`}
        >
          {isSubscribed ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden md:inline">通知ON</span>
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              <span className="hidden md:inline">通知OFF</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="border-slate-800 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" style={{ color: '#00C4CC' }} />
            プッシュ通知設定
          </DialogTitle>
          <DialogDescription>
            {isSubscribed
              ? '通知は有効です。重要な情報をリアルタイムでお知らせします。'
              : '通知を有効にすると、以下の情報をリアルタイムで受け取れます：'}
          </DialogDescription>
        </DialogHeader>

        {!isSubscribed && (
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00C4CC' }} />
              新規キャストの登録
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00C4CC' }} />
              面接予定のリマインダー
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00C4CC' }} />
              給料申請の承認通知
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#00C4CC' }} />
              重要なシステムアップデート
            </li>
          </ul>
        )}

        <div className="flex gap-2">
          {isSubscribed ? (
            <Button
              onClick={unsubscribeFromPush}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              通知を無効化
            </Button>
          ) : (
            <Button
              onClick={requestNotificationPermission}
              disabled={loading}
              className="w-full text-white"
              style={{ backgroundColor: '#00C4CC' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  設定中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  通知を有効化
                </span>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// VAPID公開鍵をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
