'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  Bell,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CastCategoryBadge, getCategoryBorderColor, getCategoryBackgroundColor, type CastCategory } from '@/components/cast-category-badge';

interface Interview {
  id: string;
  castId: number;
  castName: string;
  castAge: number;
  castCategory: CastCategory;
  currentShop?: string;
  date: Date;
  time: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  note?: string;
}

const mockInterviews: Interview[] = [
  {
    id: '1',
    castId: 1,
    castName: 'まり',
    castAge: 21,
    castCategory: 'new',
    date: new Date(2026, 1, 15, 15, 0),
    time: '15:00',
    location: 'Club LION（祇園）',
    status: 'scheduled',
    note: '業界未経験。緊張しやすいので丁寧に対応',
  },
  {
    id: '2',
    castId: 2,
    castName: 'あいり',
    castAge: 23,
    castCategory: 'active',
    currentShop: 'Lounge MIYABI',
    date: new Date(2026, 1, 17, 14, 0),
    time: '14:00',
    location: 'PLATINUM（木屋町）',
    status: 'confirmed',
    note: '移籍希望。時給アップを重視',
  },
  {
    id: '3',
    castId: 3,
    castName: 'ゆい',
    castAge: 22,
    castCategory: 'experience',
    date: new Date(2026, 1, 20, 16, 30),
    time: '16:30',
    location: 'GALAXY（先斗町）',
    status: 'scheduled',
    note: '他店で1年経験。祇園エリア希望',
  },
  {
    id: '4',
    castId: 4,
    castName: 'さくら',
    castAge: 24,
    castCategory: 'returner',
    date: new Date(2026, 1, 18, 15, 30),
    time: '15:30',
    location: 'Club LION（祇園）',
    status: 'scheduled',
    note: '1年前に一度引退。復帰希望',
  },
];

type CastCategoryFilter = 'all' | CastCategory;

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [categoryFilter, setCategoryFilter] = useState<CastCategoryFilter>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((interview) => isSameDay(interview.date, date));
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (categoryFilter === 'all') return true;
    return interview.castCategory === categoryFilter;
  });

  // 新人を優先的に上に表示
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (a.castCategory === 'new' && b.castCategory !== 'new') return -1;
    if (a.castCategory !== 'new' && b.castCategory === 'new') return 1;
    return a.date.getTime() - b.date.getTime();
  });

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setShowDetailDialog(true);
  };

  const handleStatusChange = (newStatus: Interview['status']) => {
    if (!selectedInterview) return;
    setInterviews(
      interviews.map((interview) =>
        interview.id === selectedInterview.id
          ? { ...interview, status: newStatus }
          : interview
      )
    );
    setSelectedInterview({ ...selectedInterview, status: newStatus });
  };

  const handleDeleteInterview = () => {
    if (!selectedInterview) return;
    if (confirm('この面接予定を削除してもよろしいですか？')) {
      setInterviews(interviews.filter((interview) => interview.id !== selectedInterview.id));
      setShowDetailDialog(false);
      setSelectedInterview(null);
    }
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const dayInterviews = getInterviewsForDate(day);
    if (dayInterviews.length > 0) {
      handleViewInterview(dayInterviews[0]);
    }
  };

  const getStatusBadge = (status: Interview['status']) => {
    const styles: Record<Interview['status'], { label: string; className: string }> = {
      scheduled: { label: '🟡 面接待ち', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
      confirmed: { label: '✅ 確定', className: 'bg-green-500/20 text-green-400 border-green-500/50' },
      completed: { label: '✓ 完了', className: 'bg-slate-500/20 text-slate-400 border-slate-500/50' },
      cancelled: { label: '✗ キャンセル', className: 'bg-red-500/20 text-red-400 border-red-500/50' },
    };
    const style = styles[status];
    return (
      <Badge variant="outline" className={`text-xs ${style.className}`}>
        {style.label}
      </Badge>
    );
  };

  const todayInterviews = sortedInterviews.filter((interview) => isToday(interview.date));
  const upcomingInterviews = sortedInterviews
    .filter((interview) => interview.date > new Date() && !isToday(interview.date))
    .slice(0, 5);

  const selectedDateInterviews = selectedDate ? getInterviewsForDate(selectedDate) : [];

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* 戻るリンク */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">ダッシュボードに戻る</span>
      </Link>

      {/* ヘッダー */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #00C4CC 0%, #33D4DB 100%)' }}>
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">面接スケジュール</h1>
              <p className="text-sm text-slate-400">
                {format(currentDate, 'yyyy年M月', { locale: ja })}
              </p>
            </div>
          </div>
        </div>

        <Button
          className="text-white"
          style={{ backgroundColor: '#00C4CC' }}
          onClick={() => setShowDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          面接を追加
        </Button>
      </div>

      {/* カテゴリフィルター */}
      <Card className="border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-400">フィルター:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className={`${categoryFilter === 'all' ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]' : 'border-slate-700'}`}
          >
            全て
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryFilter('new')}
            className={`${categoryFilter === 'new' ? 'bg-red-500/20 text-red-400 border-red-500' : 'border-slate-700'}`}
          >
            🆕 新人
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryFilter('experience')}
            className={`${categoryFilter === 'experience' ? 'bg-[#00C4CC]/20 text-[#00C4CC] border-[#00C4CC]' : 'border-slate-700'}`}
          >
            👩 経験あり
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryFilter('active')}
            className={`${categoryFilter === 'active' ? 'bg-green-500/20 text-green-400 border-green-500' : 'border-slate-700'}`}
          >
            🟢 稼働中
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryFilter('returner')}
            className={`${categoryFilter === 'returner' ? 'bg-orange-500/20 text-orange-400 border-orange-500' : 'border-slate-700'}`}
          >
            🔄 復帰
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* カレンダー */}
        <Card className="border-slate-800 bg-slate-900/50 p-6 lg:col-span-2">
          <div className="space-y-4">
            {/* 月切り替え */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addDays(currentDate, -30))}
                className="border-slate-700"
              >
                前月
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentDate, 'yyyy年M月', { locale: ja })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addDays(currentDate, 30))}
                className="border-slate-700"
              >
                次月
              </Button>
            </div>

            <Separator className="bg-slate-800" />

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-400">
              {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-2">
              {daysInMonth.map((day) => {
                const dayInterviews = getInterviewsForDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDateClick(day)}
                    className={`relative aspect-square rounded-lg p-2 text-sm transition-colors ${
                      isSelected
                        ? 'ring-2 ring-[#00C4CC]'
                        : isTodayDate
                        ? 'bg-slate-800'
                        : dayInterviews.length > 0
                        ? 'hover:bg-slate-800 cursor-pointer'
                        : 'hover:bg-slate-800/50'
                    }`}
                    style={isSelected ? { backgroundColor: 'rgba(0, 196, 204, 0.2)' } : undefined}
                  >
                    <span className={`block ${isTodayDate ? 'font-bold' : ''}`} style={isTodayDate ? { color: '#00C4CC' } : undefined}>
                      {format(day, 'd')}
                    </span>
                    {dayInterviews.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                        {dayInterviews.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: '#00C4CC' }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 面接リスト */}
        <div className="space-y-4">
          {/* 本日の面接 */}
          {todayInterviews.length > 0 && (
            <Card className="border-slate-800 bg-slate-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4" style={{ color: '#00C4CC' }} />
                <h4 className="font-semibold">本日の面接</h4>
              </div>
              <div className="space-y-2">
                {todayInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} onClick={() => handleViewInterview(interview)} />
                ))}
              </div>
            </Card>
          )}

          {/* 今後の予定 */}
          <Card className="border-slate-800 bg-slate-900/50 p-4">
            <h4 className="font-semibold mb-3">今後の予定</h4>
            <div className="space-y-2">
              {upcomingInterviews.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-4">
                  予定がありません
                </p>
              ) : (
                upcomingInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} onClick={() => handleViewInterview(interview)} />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 面接詳細ダイアログ */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="border-slate-800 bg-slate-900 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" style={{ color: '#00C4CC' }} />
              面接詳細
            </DialogTitle>
          </DialogHeader>

          {selectedInterview && (
            <div className="space-y-4">
              {/* キャスト情報 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'rgba(0, 196, 204, 0.2)' }}
                    >
                      <User className="h-6 w-6" style={{ color: '#00C4CC' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{selectedInterview.castName}</h3>
                        <span className="text-sm text-slate-400">({selectedInterview.castAge}歳)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <CastCategoryBadge category={selectedInterview.castCategory} />
                        {getStatusBadge(selectedInterview.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedInterview.castCategory === 'new' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-300">
                      業界未経験の新人です。丁寧な説明と安心できる対応を心がけてください。
                    </p>
                  </div>
                )}

                {selectedInterview.castCategory === 'active' && selectedInterview.currentShop && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-xs text-green-300">
                      <span className="font-medium">現在の所属:</span> {selectedInterview.currentShop}
                    </p>
                  </div>
                )}

                <Separator className="bg-slate-800" />

                {/* 日時情報 */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">面接日時</p>
                      <p className="text-sm text-slate-300">
                        {format(selectedInterview.date, 'yyyy年M月d日(E)', { locale: ja })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">時刻</p>
                      <p className="text-sm text-slate-300">{selectedInterview.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">場所</p>
                      <p className="text-sm text-slate-300">{selectedInterview.location}</p>
                    </div>
                  </div>

                  {selectedInterview.note && (
                    <div className="flex items-start gap-3">
                      <Edit className="h-4 w-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">メモ</p>
                        <p className="text-sm text-slate-300">{selectedInterview.note}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-800" />

                {/* ステータス変更 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ステータス変更</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('scheduled')}
                      className={`border-yellow-500/50 ${selectedInterview.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' : ''}`}
                    >
                      予定
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('confirmed')}
                      className={`border-green-500/50 ${selectedInterview.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : ''}`}
                    >
                      確定
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('completed')}
                      className={`border-slate-500/50 ${selectedInterview.status === 'completed' ? 'bg-slate-500/20 text-slate-400' : ''}`}
                    >
                      完了
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('cancelled')}
                      className={`border-red-500/50 ${selectedInterview.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : ''}`}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={handleDeleteInterview}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-700"
                    onClick={() => setShowDetailDialog(false)}
                  >
                    閉じる
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 面接カードコンポーネント
function InterviewCard({ interview, onClick }: { interview: Interview; onClick: () => void }) {
  const borderColor = getCategoryBorderColor(interview.castCategory);
  const backgroundColor = getCategoryBackgroundColor(interview.castCategory);

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-slate-800 p-3 space-y-2 text-left transition-all hover:border-[#00C4CC]/50"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: borderColor,
        backgroundColor,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CastCategoryBadge category={interview.castCategory} className="flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span className="font-medium">{interview.castName}</span>
            <span className="text-xs text-slate-400">({interview.castAge}歳)</span>
          </div>
        </div>
      </div>

      {interview.castCategory === 'new' && (
        <div className="flex items-center gap-1 text-xs text-red-400">
          <AlertTriangle className="h-3 w-3" />
          <span>業界未経験</span>
        </div>
      )}

      {interview.castCategory === 'active' && interview.currentShop && (
        <div className="text-xs text-green-400">
          現在: {interview.currentShop}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Clock className="h-3 w-3" />
        <span>{format(interview.date, 'M/d(E)', { locale: ja })} {interview.time}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MapPin className="h-3 w-3" />
        <span>{interview.location}</span>
      </div>

      {interview.note && interview.castCategory === 'new' && (
        <div className="text-xs text-slate-300 bg-slate-800/50 rounded p-2">
          💡 {interview.note}
        </div>
      )}
    </button>
  );
}
