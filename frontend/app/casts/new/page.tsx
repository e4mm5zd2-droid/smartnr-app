"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Sparkles, Camera, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { analyzeFace, getShopRecommendations, createCast, type FaceAnalysisResult, type Shop } from "@/lib/api";
import Image from "next/image";

export default function NewCastPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FaceAnalysisResult | null>(null);
  const [recommendations, setRecommendations] = useState<Shop[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // フォーム状態
  const [genjiName, setGenjiName] = useState("");
  const [realNameInitial, setRealNameInitial] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [desiredArea, setDesiredArea] = useState("");
  const [notes, setNotes] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);

    // AI分析開始
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeFace(file);
      setAnalysisResult(result);
      
      // 年齢範囲から中央値を取得（例: "20-23歳" → 21）
      const ageMatch = result.age_range.match(/(\d+)-(\d+)/);
      if (ageMatch) {
        const avgAge = Math.floor((parseInt(ageMatch[1]) + parseInt(ageMatch[2])) / 2);
        setAge(avgAge.toString());
        
        // 店舗レコメンド取得
        const shops = await getShopRecommendations(avgAge, result.tags);
        setRecommendations(shops);
      }
    } catch (err) {
      setError("画像分析に失敗しました。別の画像をお試しください。");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createCast({
        genji_name: genjiName,
        real_name_initial: realNameInitial,
        age: parseInt(age),
        phone,
        line_id: lineId,
        looks_tags: analysisResult?.tags || [],
        status: "募集中",
        notes: `希望エリア: ${desiredArea}\n${notes}`,
      });
      
      setSubmitSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError("登録に失敗しました。入力内容を確認してください。");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-white transition-colors w-fit" style={{ color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00C4CC')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'white')}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">ダッシュボードに戻る</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">新規キャスト登録</h1>
            <p className="text-slate-400">写真アップロードでAI自動分析</p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-green-300">
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <p className="font-bold">登録完了！</p>
                    <p className="text-sm">ダッシュボードに戻ります...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  写真アップロード
                  <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/50">
                    AI分析
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  顔写真をアップロードすると自動で年齢・雰囲気を分析します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {!image ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-800/50 hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                    <Upload className="w-12 h-12 text-slate-600 group-hover:text-purple-400 transition-colors" />
                    <div className="text-center">
                      <p className="text-white font-medium">写真をアップロード</p>
                      <p className="text-sm text-slate-500">クリックして画像を選択</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative">
                    <div className="relative w-full h-64 rounded-xl overflow-hidden">
                      <Image
                        src={image}
                        alt="アップロード画像"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImage(null);
                        setImageFile(null);
                        setAnalysisResult(null);
                        setRecommendations([]);
                      }}
                      className="mt-2 w-full"
                    >
                      別の画像を選択
                    </Button>
                  </div>
                )}

                {/* AI Analysis Result */}
                {isAnalyzing && (
                  <div className="space-y-3 p-4 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">AI分析中...</span>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}

                {analysisResult && !isAnalyzing && (
                  <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-bold">AI分析完了</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="text-slate-400">推定年齢:</span>{" "}
                        <span className="font-bold">{analysisResult.age_range}</span>
                      </p>
                      <p className="text-white">
                        <span className="text-slate-400">髪型:</span>{" "}
                        <span className="font-medium">{analysisResult.hairstyle}</span>
                      </p>
                      <div>
                        <p className="text-slate-400 mb-2">雰囲気タグ:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.tags.map((tag, i) => (
                            <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Shops */}
            {recommendations.length > 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    おすすめ店舗
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    AIが最適な店舗を提案しています
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.map((shop) => (
                    <div
                      key={shop.id}
                      className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-bold">{shop.name}</h3>
                          <p className="text-sm text-slate-400">
                            {shop.area} / {shop.system_type}
                          </p>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                          {Math.round(shop.match_score)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-300">{shop.reason}</p>
                      <p className="text-sm text-emerald-300 font-medium">
                        時給 ¥{shop.hourly_wage_min.toLocaleString()} - ¥{shop.hourly_wage_max.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Form Fields */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">源氏名 *</label>
                  <Input
                    required
                    value={genjiName}
                    onChange={(e) => setGenjiName(e.target.value)}
                    placeholder="例: 愛"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">本名イニシャル</label>
                  <Input
                    value={realNameInitial}
                    onChange={(e) => setRealNameInitial(e.target.value)}
                    placeholder="例: S.A"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">年齢 *</label>
                  <Input
                    required
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="例: 21"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">電話番号 *</label>
                  <Input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090-1234-5678"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">LINE ID</label>
                  <Input
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    placeholder="例: ai_cute21"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">希望エリア</label>
                  <Select value={desiredArea} onValueChange={setDesiredArea}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="エリアを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="祇園">祇園</SelectItem>
                      <SelectItem value="木屋町">木屋町</SelectItem>
                      <SelectItem value="先斗町">先斗町</SelectItem>
                      <SelectItem value="河原町">河原町</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">備考</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="その他特記事項"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !genjiName || !age || !phone}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
            >
              {isSubmitting ? "登録中..." : "キャストを登録"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
