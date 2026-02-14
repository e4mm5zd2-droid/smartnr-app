'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // URLハッシュからトークンを確認
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('無効なリセットリンクです。もう一度パスワードリセットを行ってください。');
    }
  }, []);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Update password error:', err);
      setError('パスワード更新に失敗しました。もう一度お試しください。');
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
          <h2 className="text-2xl font-bold mb-2">パスワード更新完了！</h2>
          <p className="text-slate-400 mb-6">
            新しいパスワードが設定されました。<br />
            新しいパスワードでログインしてください。
          </p>
          <p className="text-sm text-slate-500">
            3秒後にログインページへ移動します...
          </p>
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
            新しいパスワードを設定
          </p>
        </div>

        {/* パスワード更新フォーム */}
        <Card className="border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  新しいパスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8文字以上（大文字・数字を含む）"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="bg-slate-800 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  ※ 8文字以上、大文字・数字を含む必要があります
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  パスワード（確認）
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="もう一度入力してください"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="bg-slate-800 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
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
                  更新中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  パスワードを更新
                </span>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
