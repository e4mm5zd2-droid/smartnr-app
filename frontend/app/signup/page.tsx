'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, UserPlus, Mail, Lock, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }
    if (!/[A-Z]/.test(password)) {
      return 'パスワードには大文字を含めてください';
    }
    if (!/[0-9]/.test(password)) {
      return 'パスワードには数字を含めてください';
    }
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // バリデーション
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // scouts テーブルにユーザー情報を登録
        const { error: insertError } = await supabase
          .from('scouts')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
          });

        if (insertError) {
          console.error('Scout insertion error:', insertError);
          // エラーでも登録は成功しているので続行
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('登録に失敗しました。もう一度お試しください。');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <Card className="w-full max-w-md border-0 bg-zinc-900/50 p-8 backdrop-blur-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
            <CheckCircle2 className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">登録完了！</h2>
          <p className="text-zinc-400 mb-6">
            確認メールを送信しました。<br />
            メール内のリンクをクリックして認証を完了してください。
          </p>
          <p className="text-sm text-zinc-500">
            3秒後にログインページへ移動します...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* ロゴ・ヘッダー */}
        <div className="text-center">
          <Link href="/login">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform bg-zinc-600">
              <span className="text-3xl font-bold text-white">SN</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Smart</span>
            <span className="smartnr-logo-nr text-4xl">NR</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            アカウント新規登録
          </p>
        </div>

        {/* 登録フォーム */}
        <Card className="border-0 bg-zinc-900/50 p-8 backdrop-blur-sm">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-zinc-800 border border-zinc-600 p-3 text-sm text-zinc-300">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  お名前
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="山田 太郎"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-zinc-800 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
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
                    className="bg-zinc-800 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8文字以上（大文字・数字を含む）"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-zinc-800 pl-10 pr-10"
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
                <p className="text-xs text-zinc-500">
                  ※ 8文字以上、大文字・数字を含む必要があります
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  パスワード（確認）
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="もう一度入力してください"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="bg-zinc-800 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-zinc-400">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-800 focus:ring-offset-0 accent-zinc-500"
                required
              />
              <span>
                <a href="#" className="hover:underline text-zinc-300">利用規約</a>
                および
                <a href="#" className="hover:underline text-zinc-300">プライバシーポリシー</a>
                に同意します
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white bg-zinc-600 hover:bg-zinc-500 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  登録中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  アカウントを作成
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-900 px-2 text-zinc-400">
                  または
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full border-zinc-700"
                onClick={() => alert('Google連携は実装予定です')}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleで登録
              </Button>
            </div>
          </div>
        </Card>

        {/* フッター */}
        <div className="text-center text-sm text-zinc-400">
          すでにアカウントをお持ちの方は{' '}
          <Link
            href="/login"
            className="hover:underline text-zinc-300"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  );
}
