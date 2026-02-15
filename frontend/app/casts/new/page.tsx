"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, CheckCircle2, Camera, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCast } from "@/lib/api";
import { CastCategoryBadge, type CastCategory } from "@/components/cast-category-badge";

type Step = 'input' | 'confirm' | 'complete';

interface ParsedCastInfo {
  genji_name?: string | null;
  real_name_initial?: string | null;
  age?: number | null;
  height?: number | null;
  phone?: string | null;
  line_id?: string | null;
  experience?: string | null;
  preferred_area?: string | null;
  looks_tags?: string[] | null;
  availability?: string | null;
  notes?: string | null;
}

export default function NewCastPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [activeTab, setActiveTab] = useState<'text' | 'screenshot'>('text');
  
  // Step 1: Input
  const [rawText, setRawText] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Step 2: Confirm
  const [parsedData, setParsedData] = useState<ParsedCastInfo>({});
  const [confidence, setConfidence] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 3: Complete
  const [registeredCast, setRegisteredCast] = useState<{ id: number; name: string; age: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // フォーム状態（Step 2で編集可能）
  const [formData, setFormData] = useState<{
    genji_name: string;
    real_name_initial: string;
    age: string;
    height: string;
    phone: string;
    line_id: string;
    experience: string;
    preferred_area: string;
    looks_tags: string[];
    availability: string;
    current_shop: string;
    notes: string;
  }>({
    genji_name: "",
    real_name_initial: "",
    age: "",
    height: "",
    phone: "",
    line_id: "",
    experience: "未経験",
    preferred_area: "",
    looks_tags: [],
    availability: "",
    current_shop: "",
    notes: "",
  });

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setParseError("画像サイズは5MB以下にしてください");
      return;
    }

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setScreenshotFile(file);
    setParseError(null);
  };

  const handleParseText = async () => {
    if (!rawText.trim()) {
      setParseError("テキストを入力してください");
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com').replace(/\/+$/, '');
      const response = await fetch(`${API_BASE_URL}/api/cast-parser/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw_text: rawText }),
      });

      if (!response.ok) {
        throw new Error('解析に失敗しました');
      }

      const data = await response.json();
      setParsedData(data.parsed);
      setConfidence(data.confidence);
      
      // フォームデータに反映
      setFormData({
        genji_name: data.parsed.genji_name || "",
        real_name_initial: data.parsed.real_name_initial || "",
        age: data.parsed.age?.toString() || "",
        height: data.parsed.height?.toString() || "",
        phone: data.parsed.phone || "",
        line_id: data.parsed.line_id || "",
        experience: data.parsed.experience || "未経験",
        preferred_area: data.parsed.preferred_area || "",
        looks_tags: data.parsed.looks_tags || [],
        availability: data.parsed.availability || "",
        current_shop: "",
        notes: data.parsed.notes || "",
      });

      setStep('confirm');
    } catch (error) {
      console.error('Parse error:', error);
      setParseError("テキストから情報を読み取れませんでした。手動で入力してください。");
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseImage = async () => {
    if (!screenshotFile) {
      setParseError("画像を選択してください");
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://smartnr-backend.onrender.com').replace(/\/+$/, '');
      const formData = new FormData();
      formData.append('image', screenshotFile);

      const response = await fetch(`${API_BASE_URL}/api/cast-parser/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像解析に失敗しました');
      }

      const data = await response.json();
      setParsedData(data.parsed);
      setConfidence(data.confidence);
      
      // フォームデータに反映
      setFormData({
        genji_name: data.parsed.genji_name || "",
        real_name_initial: data.parsed.real_name_initial || "",
        age: data.parsed.age?.toString() || "",
        height: data.parsed.height?.toString() || "",
        phone: data.parsed.phone || "",
        line_id: data.parsed.line_id || "",
        experience: data.parsed.experience || "未経験",
        preferred_area: data.parsed.preferred_area || "",
        looks_tags: data.parsed.looks_tags || [],
        availability: data.parsed.availability || "",
        current_shop: "",
        notes: data.parsed.notes || "",
      });

      setStep('confirm');
    } catch (error) {
      console.error('Parse error:', error);
      setParseError("画像を読み取れませんでした。以下をお試しください:\n・画像が鮮明か確認\n・テキストが写っている部分を拡大してスクショ\n・テキストをコピペで入力");
    } finally {
      setIsParsing(false);
    }
  };

  const handleManualInput = () => {
    // 空のフォームでconfirmステップに移動
    setConfidence(0);
    setParsedData({});
    setStep('confirm');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // カテゴリ自動判定
      let castCategory: CastCategory = 'new';
      let isNew = true;
      
      if (formData.experience === '未経験') {
        castCategory = 'new';
        isNew = true;
      } else if (formData.current_shop) {
        castCategory = 'active';
        isNew = false;
      } else if (formData.experience !== '未経験') {
        castCategory = 'experience';
        isNew = false;
      }

      const cast = await createCast({
        genji_name: formData.genji_name,
        real_name_initial: formData.real_name_initial || undefined,
        age: parseInt(formData.age),
        phone: formData.phone,
        line_id: formData.line_id || undefined,
        looks_tags: formData.looks_tags,
        status: "募集中",
        experience: formData.experience,
        preferred_area: formData.preferred_area,
        is_new: isNew,
        cast_category: castCategory,
        current_shop: formData.current_shop || undefined,
        notes: formData.notes,
      });

      setRegisteredCast({
        id: cast.id,
        name: cast.genji_name,
        age: cast.age,
      });
      setStep('complete');
    } catch (error) {
      console.error('Submit error:', error);
      alert("登録に失敗しました。入力内容を確認してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLookTag = (tag: string) => {
    if (!formData.looks_tags.includes(tag)) {
      setFormData({ ...formData, looks_tags: [...formData.looks_tags, tag] });
    }
  };

  const removeLookTag = (tag: string) => {
    setFormData({ ...formData, looks_tags: formData.looks_tags.filter(t => t !== tag) });
  };

  // 信頼度に応じた色
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return { bg: 'bg-green-500', text: 'text-green-400' };
    if (conf >= 0.5) return { bg: 'bg-yellow-500', text: 'text-yellow-400' };
    return { bg: 'bg-red-500', text: 'text-red-400' };
  };

  const confidenceColors = getConfidenceColor(confidence);

  // カテゴリ判定プレビュー
  const getCategoryPreview = (): CastCategory => {
    if (formData.experience === '未経験') return 'new';
    if (formData.current_shop) return 'active';
    if (formData.experience !== '未経験') return 'experience';
    return 'new';
  };

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      {/* 戻るリンク */}
      <Link 
        href="/casts" 
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">キャスト一覧に戻る</span>
      </Link>

      {/* ========== Step 1: Input ========== */}
      {step === 'input' && (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">👩 新規キャスト登録</h1>
            <p className="text-slate-400">
              💡 LINEのトークやメモを<br className="sm:hidden" />
              貼り付けるだけでOK！
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/50 p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'screenshot')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  📋 テキスト
                </TabsTrigger>
                <TabsTrigger value="screenshot" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  📸 スクショ
                </TabsTrigger>
              </TabsList>

              {/* テキストタブ */}
              <TabsContent value="text" className="space-y-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="LINEのトークをコピーしてここに貼り付けてください&#10;&#10;例:&#10;名前: まり&#10;21歳 清楚系&#10;090-1234-5678&#10;未経験 京都希望"
                  className="w-full min-h-[200px] rounded-xl bg-slate-800 border border-slate-700 p-4 text-white text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#00C4CC]/50"
                  style={{ fontSize: '16px' }} // iOS zoom prevention
                />

                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    📝 例: こんな形式でOK<br />
                    「まり 21歳 清楚系 090-xxxx-xxxx 未経験 京都希望 週3」
                  </p>
                </div>

                {parseError && activeTab === 'text' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">
                    {parseError}
                  </div>
                )}

                <Button
                  onClick={handleParseText}
                  disabled={isParsing || !rawText.trim()}
                  className="w-full py-4 text-white font-bold"
                  style={{ backgroundColor: isParsing ? '#6B7280' : '#00C4CC' }}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      🤖 読み取り中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      🤖 AIで読み取る
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* スクショタブ */}
              <TabsContent value="screenshot" className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-[#00C4CC]/50 transition-colors bg-slate-800/30"
                >
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <img src={screenshotPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      <p className="text-sm text-slate-400">タップして別の画像を選択</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Camera className="h-12 w-12 mx-auto text-slate-400" />
                      <div>
                        <p className="text-white font-medium">📸 タップして</p>
                        <p className="text-white font-medium">スクショを選択</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        LINEのトーク画面や<br />
                        メモアプリのスクショOK
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />

                {parseError && activeTab === 'screenshot' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 whitespace-pre-line">
                    {parseError}
                  </div>
                )}

                <Button
                  onClick={handleParseImage}
                  disabled={isParsing || !screenshotFile}
                  className="w-full py-4 text-white font-bold"
                  style={{ backgroundColor: isParsing ? '#6B7280' : '#00C4CC' }}
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      🤖 読み取り中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      🤖 AIで読み取る
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400 mb-3">─── または ───</p>
              <Button
                variant="outline"
                onClick={handleManualInput}
                className="border-slate-700 hover:bg-slate-800"
              >
                ✏️ 手動で入力する
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* ========== Step 2: Confirm ========== */}
      {step === 'confirm' && (
        <>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">✅ 読み取り結果</h1>
            {confidence > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">信頼度:</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden max-w-xs">
                    <div 
                      className={`h-full ${confidenceColors.bg} transition-all`}
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${confidenceColors.text}`}>
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  ⚠️ 内容を確認して、間違いがあれば修正
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  源氏名 *
                </label>
                <Input
                  required
                  value={formData.genji_name}
                  onChange={(e) => setFormData({ ...formData, genji_name: e.target.value })}
                  placeholder="例: まり"
                  className="bg-slate-800 border-slate-700 text-white"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  本名イニシャル
                </label>
                <Input
                  value={formData.real_name_initial}
                  onChange={(e) => setFormData({ ...formData, real_name_initial: e.target.value })}
                  placeholder="例: T.M"
                  className="bg-slate-800 border-slate-700 text-white"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400 flex items-center gap-1">
                    {confidence > 0 && <span className="text-xs">🤖</span>}
                    年齢 *
                  </label>
                  <Input
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="21"
                    className="bg-slate-800 border-slate-700 text-white"
                    style={{ fontSize: '16px' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400 flex items-center gap-1">
                    {confidence > 0 && <span className="text-xs">🤖</span>}
                    身長 (cm)
                  </label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="162"
                    className="bg-slate-800 border-slate-700 text-white"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  電話番号 *
                </label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="090-1234-5678"
                  className="bg-slate-800 border-slate-700 text-white"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  LINE ID
                </label>
                <Input
                  value={formData.line_id}
                  onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                  placeholder="例: mari_xxx"
                  className="bg-slate-800 border-slate-700 text-white"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  経験 *
                </label>
                <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="未経験">未経験</SelectItem>
                    <SelectItem value="半年未満">半年未満</SelectItem>
                    <SelectItem value="1年以上">1年以上</SelectItem>
                    <SelectItem value="3年以上">3年以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.experience !== '未経験' && (
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">
                    現在の所属店舗（稼働中の場合）
                  </label>
                  <Input
                    value={formData.current_shop}
                    onChange={(e) => setFormData({ ...formData, current_shop: e.target.value })}
                    placeholder="例: Lounge MIYABI"
                    className="bg-slate-800 border-slate-700 text-white"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  希望エリア
                </label>
                <Select value={formData.preferred_area} onValueChange={(value) => setFormData({ ...formData, preferred_area: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="エリアを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="祇園">祇園</SelectItem>
                    <SelectItem value="木屋町">木屋町</SelectItem>
                    <SelectItem value="先斗町">先斗町</SelectItem>
                    <SelectItem value="河原町">河原町</SelectItem>
                    <SelectItem value="北新地">北新地</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  外見タグ
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.looks_tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-[#00C4CC]/10 text-[#00C4CC] border-[#00C4CC]/30 cursor-pointer"
                      onClick={() => removeLookTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['清楚系', 'ギャル系', '大人系', '可愛い系', 'クール系', '元気系'].map((tag) => (
                    !formData.looks_tags.includes(tag) && (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addLookTag(tag)}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        + {tag}
                      </Button>
                    )
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  勤務希望
                </label>
                <Input
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="例: 週3"
                  className="bg-slate-800 border-slate-700 text-white"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-1">
                  {confidence > 0 && <span className="text-xs">🤖</span>}
                  メモ
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="その他の情報"
                  rows={3}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#00C4CC]/50"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">カテゴリ（自動判定）</label>
                <div className="flex items-center gap-2">
                  <CastCategoryBadge category={getCategoryPreview()} />
                  <span className="text-xs text-slate-500">
                    ※ 経験と所属店舗から自動判定されます
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('input')}
                className="flex-1 border-slate-700"
              >
                ← 読み取りに戻る
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 text-white font-bold"
                style={{ backgroundColor: isSubmitting ? '#6B7280' : '#00C4CC' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登録中...
                  </>
                ) : (
                  <>
                    👩 登録する
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      )}

      {/* ========== Step 3: Complete ========== */}
      {step === 'complete' && registeredCast && (
        <Card className="border-slate-800 bg-slate-900/50 p-8 text-center space-y-6">
          <div className="space-y-3">
            <CheckCircle2 className="h-16 w-16 mx-auto" style={{ color: '#00C4CC' }} />
            <h1 className="text-3xl font-bold">🎉 登録完了！</h1>
            <p className="text-slate-300">
              <span className="text-2xl font-bold">{registeredCast.name}</span>
              <span className="text-slate-400">（{registeredCast.age}歳）</span>
              <CastCategoryBadge category={getCategoryPreview()} className="ml-2" />
            </p>
            <p className="text-slate-400">が登録されました</p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href={`/concierge?tab=matching&cast_id=${registeredCast.id}`}>
              <Button
                className="w-full py-4 text-white font-bold text-lg"
                style={{ backgroundColor: '#00C4CC' }}
              >
                🎯 店舗マッチングへ
              </Button>
            </Link>
            <Link href="/casts">
              <Button variant="outline" className="w-full border-slate-700">
                📋 キャスト一覧へ
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setStep('input');
                setRawText("");
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setFormData({
                  genji_name: "",
                  real_name_initial: "",
                  age: "",
                  height: "",
                  phone: "",
                  line_id: "",
                  experience: "未経験",
                  preferred_area: "",
                  looks_tags: [],
                  availability: "",
                  current_shop: "",
                  notes: "",
                });
              }}
              className="w-full border-slate-700"
            >
              + もう1人登録
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
