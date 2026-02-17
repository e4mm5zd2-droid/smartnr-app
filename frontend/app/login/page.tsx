'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('ログインに失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* ロゴ・ヘッダー */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
            <span className="text-3xl font-bold text-zinc-950">SN</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Smart</span>
            <span className="smartnr-logo-nr text-4xl">NR</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            ナイトワーク求人管理システム
          </p>
        </div>

        {/* ログインフォーム */}
        <Card className="bg-zinc-900 p-8 backdrop-blur-sm rounded-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="scout@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="bg-zinc-800 border-none pl-10 focus:ring-1 focus:ring-zinc-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-zinc-800 border-none pl-10 pr-10 focus:ring-1 focus:ring-zinc-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 focus:ring-offset-0"
                  style={{ accentColor: '#ffffff' }}
                />
                <span className="text-zinc-400">ログイン状態を保持</span>
              </label>
              <Link
                href="/reset-password"
                className="text-zinc-400 hover:text-white hover:underline"
              >
                パスワードを忘れた?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl h-12 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ログイン中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  ログイン
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* フッター */}
        <div className="text-center text-sm text-zinc-400">
          アカウントをお持ちでない方は{' '}
          <Link
            href="/signup"
            className="text-white hover:underline"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}
