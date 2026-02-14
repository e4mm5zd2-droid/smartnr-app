'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('パスワードリセットに失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(0, 196, 204, 0.2)' }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: '#00C4CC' }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">メールを送信しました</h2>
          <p className="text-slate-400 mb-6">
            <span className="font-medium" style={{ color: '#00C4CC' }}>{email}</span>
            <br />
            にパスワードリセット用のリンクを送信しました。<br />
            メール内のリンクをクリックしてパスワードを再設定してください。
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full border-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ログインページに戻る
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* ロゴ・ヘッダー */}
        <div className="text-center">
          <Link href="/login">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: '#00C4CC' }}>
              <span className="text-3xl font-bold text-white">SN</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Smart</span>
            <span className="smartnr-logo-nr text-4xl">NR</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            パスワードをお忘れの方
          </p>
        </div>

        {/* リセットフォーム */}
        <Card className="border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  登録メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="scout@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">
                  パスワードリセット用のリンクをメールで送信します
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white transition-all"
              style={{ backgroundColor: '#00C4CC' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00A3AA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4CC')}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  送信中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  リセットリンクを送信
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* フッター */}
        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-sm text-slate-400 hover:text-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ログインページに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
