"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, CheckCircle2, UserPlus, Sparkles, MapPin, DollarSign, Image as ImageIcon, X } from "lucide-react";
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

interface ShopRecommendation {
  shop_id: number;
  shop_name: string;
  match_score: number;
  ai_reason: string;
  hourly_wage_min?: number;
  hourly_wage_max?: number;
}

export default function NewCastPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<ShopRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // AI入力アシスト
  const [aiInputText, setAiInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    genji_name: "",
    age: "",
    phone: "",
    line_id: "",
    experience: "未経験",
    preferred_area: "",
    looks_tags: [] as string[],
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

  const handleAIMatch = async () => {
    if (!formData.age || !formData.preferred_area) {
      setError("AIマッチングには年齢と希望エリアの入力が必要です");
      return;
    }

    setIsLoadingAI(true);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com';
      const params = new URLSearchParams({
        age: formData.age,
        area: formData.preferred_area,
      });
      if (formData.looks_tags.length > 0) {
        params.append('looks', formData.looks_tags.join(','));
      }

      const res = await fetch(`${API_BASE_URL}/api/shops/recommend?${params.toString()}`);
      if (!res.ok) throw new Error('AI matching failed');
      
      const data = await res.json();
      setAiRecommendations(data.slice(0, 3)); // Top 3のみ表示
    } catch (err) {
      console.error('AI matching error:', err);
      setError('AIマッチングに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAIAnalyze = async () => {
    if (!aiInputText.trim() && !selectedImage) {
      setError("テキストまたは画像を入力してください");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisSuccess(false);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com';
      let parsedData: any = {};

      // 画像がある場合は画像解析を優先
      if (selectedImage) {
        const formDataImg = new FormData();
        formDataImg.append('file', selectedImage);

        const res = await fetch(`${API_BASE_URL}/api/cast-parser/image`, {
          method: 'POST',
          body: formDataImg,
        });

        if (!res.ok) throw new Error('Image analysis failed');
        const data = await res.json();
        parsedData = data.parsed;
      } 
      // テキストのみの場合
      else if (aiInputText.trim()) {
        const res = await fetch(`${API_BASE_URL}/api/cast-parser/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_text: aiInputText }),
        });

        if (!res.ok) throw new Error('Text analysis failed');
        const data = await res.json();
        parsedData = data.parsed;
      }

      // フォームに自動入力
      setFormData(prev => ({
        ...prev,
        genji_name: parsedData.genji_name || prev.genji_name,
        age: parsedData.age ? String(parsedData.age) : prev.age,
        phone: parsedData.phone || prev.phone,
        line_id: parsedData.line_id || prev.line_id,
        experience: parsedData.experience || prev.experience,
        preferred_area: parsedData.preferred_area || prev.preferred_area,
        looks_tags: parsedData.looks_tags || prev.looks_tags,
        notes: parsedData.notes || prev.notes,
      }));

      setAnalysisSuccess(true);
      setTimeout(() => setAnalysisSuccess(false), 3000);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('AI解析に失敗しました。もう一度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
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
      if (formData.experience && formData.experience !== '未経験') {
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

      {/* 成功メッセージ */}
      {analysisSuccess && (
        <Card className="border-green-500/50 bg-green-500/10 p-4 rounded-xl">
          <p className="text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            ✅ 解析完了！フォームに自動入力しました
          </p>
        </Card>
      )}

      {/* AI入力アシスト */}
      <Card className="bg-zinc-900 p-5 rounded-xl border-2 border-white/10">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-white flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">🤖 AI入力アシスト</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              テキストを入力するか、スクショを貼り付けるとAIが自動で項目に振り分けます
            </p>
          </div>
        </div>

        {/* テキスト入力エリア */}
        <Textarea
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
          placeholder="例：まり 21歳 ギャル 祇園希望 LINE: mari_xxx&#10;またはLINEのスクショを貼り付け"
          className="bg-zinc-900 border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 min-h-[120px] focus:ring-1 focus:ring-zinc-600 mb-3"
        />

        {/* 画像プレビュー */}
        {imagePreview && (
          <div className="relative mb-3">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-48 object-contain rounded-lg bg-zinc-800"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-zinc-950/80 rounded-full p-1.5 hover:bg-zinc-900"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* ボタンエリア */}
        <div className="flex gap-3">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-3 cursor-pointer transition">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">📎 画像を追加</span>
            </div>
          </label>
          
          <Button
            type="button"
            onClick={handleAIAnalyze}
            disabled={isAnalyzing || (!aiInputText.trim() && !selectedImage)}
            className="flex-1 bg-white text-zinc-950 hover:bg-zinc-200 h-auto py-3 rounded-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AIで解析する
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* 区切り線 */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 border-t border-zinc-800"></div>
        <span className="text-sm text-zinc-500">または手動で入力</span>
        <div className="flex-1 border-t border-zinc-800"></div>
      </div>

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
            className="bg-zinc-900 border-none rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600"
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
            className="bg-zinc-900 border-none rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600"
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
            className="bg-zinc-900 border-none rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600"
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
            className="bg-zinc-900 border-none rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600"
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
            <SelectTrigger className="bg-zinc-900 border-none rounded-lg px-4 py-3">
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
            <SelectTrigger className="bg-zinc-900 border-none rounded-lg px-4 py-3">
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
            メモ
          </label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="その他の情報があれば記入してください"
            className="bg-zinc-900 border-none rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 min-h-[100px] focus:ring-1 focus:ring-zinc-600"
          />
        </Card>

        {/* AIマッチングボタン */}
        <Card className="bg-zinc-900 p-5 rounded-xl border-2 border-white/10">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="h-5 w-5 text-white flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">AIで店舗マッチング</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                入力情報をもとにAIが最適な店舗を提案します
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAIMatch}
            disabled={isLoadingAI || !formData.age || !formData.preferred_area}
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 h-10 rounded-lg"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AIマッチング実行
              </>
            )}
          </Button>
        </Card>

        {/* AI推奨店舗表示 */}
        {aiRecommendations.length > 0 && (
          <Card className="bg-zinc-900 p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-3">🎯 おすすめ店舗 Top 3</h3>
            <div className="space-y-3">
              {aiRecommendations.map((shop, idx) => (
                <Card key={shop.shop_id} className="bg-zinc-800 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </span>
                      <h4 className="font-semibold text-white">{shop.shop_name}</h4>
                    </div>
                    <Badge className="bg-white text-zinc-950 text-xs font-bold">
                      {Math.round(shop.match_score)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-300 mb-2 leading-relaxed">{shop.ai_reason}</p>
                  {shop.hourly_wage_min && shop.hourly_wage_max && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <DollarSign className="h-3 w-3" />
                      時給 ¥{shop.hourly_wage_min.toLocaleString()} - ¥{shop.hourly_wage_max.toLocaleString()}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}

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
