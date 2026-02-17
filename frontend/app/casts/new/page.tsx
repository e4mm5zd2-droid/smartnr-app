"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCast } from "@/lib/api";

const looksTagOptions = [
  "ギャル系",
  "清楚系",
  "お姉系",
  "ハーフ系",
  "アイドル系",
  "モデル系",
  "癒し系",
  "カジュアル系",
];

const areaOptions = [
  "祇園",
  "木屋町",
  "先斗町",
  "河原町",
  "烏丸",
  "四条",
  "三条",
  "その他",
];

export default function NewCastPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    genji_name: "",
    age: "",
    phone: "",
    line_id: "",
    experience: "未経験",
    preferred_area: "",
    looks_tags: [] as string[],
    availability: "",
    current_shop: "",
    notes: "",
  });

  const handleLooksTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      looks_tags: prev.looks_tags.includes(tag)
        ? prev.looks_tags.filter(t => t !== tag)
        : [...prev.looks_tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.genji_name.trim()) {
      setError("源氏名を入力してください");
      return;
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 50) {
      setError("年齢は18〜50の範囲で入力してください");
      return;
    }
    if (!formData.phone.trim()) {
      setError("電話番号を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      let cast_category: 'new' | 'experience' | 'active' | 'returner' = 'new';
      if (formData.current_shop && formData.availability === '稼働中') {
        cast_category = 'active';
      } else if (formData.experience && formData.experience !== '未経験') {
        cast_category = 'experience';
      }

      const castData = {
        genji_name: formData.genji_name,
        age: parseInt(formData.age),
        phone: formData.phone,
        line_id: formData.line_id || undefined,
        experience: formData.experience,
        preferred_area: formData.preferred_area || undefined,
        looks_tags: formData.looks_tags.length > 0 ? formData.looks_tags : undefined,
        notes: formData.notes || undefined,
        current_shop: formData.current_shop || undefined,
        cast_category,
        status: 'pending',
      };

      await createCast(castData);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/casts');
      }, 2000);
    } catch (err) {
      console.error('登録エラー:', err);
      setError('登録に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="bg-zinc-900 p-8 text-center max-w-md w-full rounded-2xl">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-bold text-white mb-2">登録完了</h2>
          <p className="text-zinc-400 mb-4">
            キャスト「{formData.genji_name}」を登録しました
          </p>
          <p className="text-sm text-zinc-500">一覧ページに移動します...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Link href="/casts">
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">新規キャスト登録</h1>
          <p className="text-sm text-zinc-400">基本情報を入力してください</p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10 p-4 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            源氏名 <span className="text-red-400">*</span>
          </label>
          <Input
            value={formData.genji_name}
            onChange={(e) => setFormData({ ...formData, genji_name: e.target.value })}
            placeholder="例: まり"
            className="bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-zinc-600"
            required
          />
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            年齢 <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="例: 21"
            min="18"
            max="50"
            className="bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-zinc-600"
            required
          />
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            電話番号 <span className="text-red-400">*</span>
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="例: 090-1234-5678"
            className="bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-zinc-600"
            required
          />
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            LINE ID
          </label>
          <Input
            value={formData.line_id}
            onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
            placeholder="例: mari_kyoto"
            className="bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-zinc-600"
          />
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-3">
            ルックス系統
          </label>
          <div className="flex flex-wrap gap-2">
            {looksTagOptions.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                onClick={() => handleLooksTagToggle(tag)}
                className={`cursor-pointer transition-colors ${
                  formData.looks_tags.includes(tag)
                    ? 'bg-white text-zinc-950 border-white'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            経験
          </label>
          <Select
            value={formData.experience}
            onValueChange={(value) => setFormData({ ...formData, experience: value })}
          >
            <SelectTrigger className="bg-zinc-800 border-none rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="未経験">未経験</SelectItem>
              <SelectItem value="1年未満">1年未満</SelectItem>
              <SelectItem value="1〜3年">1〜3年</SelectItem>
              <SelectItem value="3年以上">3年以上</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            希望エリア
          </label>
          <Select
            value={formData.preferred_area}
            onValueChange={(value) => setFormData({ ...formData, preferred_area: value })}
          >
            <SelectTrigger className="bg-zinc-800 border-none rounded-lg">
              <SelectValue placeholder="エリアを選択" />
            </SelectTrigger>
            <SelectContent>
              {areaOptions.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            現在の稼働店舗
          </label>
          <Input
            value={formData.current_shop}
            onChange={(e) => setFormData({ ...formData, current_shop: e.target.value })}
            placeholder="例: Club LION（稼働中の場合）"
            className="bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-zinc-600"
          />
        </Card>

        <Card className="bg-zinc-900 p-5 rounded-xl">
          <label className="block text-sm font-medium text-white mb-2">
            メモ
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="その他の情報があれば記入してください"
            className="bg-zinc-800 border-none rounded-lg min-h-[100px] focus:ring-1 focus:ring-zinc-600"
          />
        </Card>

        {/* 保存ボタン */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              登録中...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-5 w-5" />
              キャストを登録
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
