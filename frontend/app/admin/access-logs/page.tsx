"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  Activity,
  Eye,
  Clock,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

interface AccessLog {
  id: number
  user_email: string
  user_role: string
  request_method: string
  request_path: string
  response_status: number
  response_time_ms: number
  ip_address: string
  action_type: string
  resource_type: string
  created_at: string
  error_message?: string
}

interface AccessLogStats {
  log_date: string
  total_requests: number
  unique_users: number
  unique_ips: number
  login_count: number
  error_count: number
  create_count: number
  update_count: number
  delete_count: number
  export_count: number
  avg_response_time_ms: number
}

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [stats, setStats] = useState<AccessLogStats[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // フィルター
  const [filterEmail, setFilterEmail] = useState("")
  const [filterAction, setFilterAction] = useState<string>("")
  const [filterResource, setFilterResource] = useState<string>("")
  const [filterStatusMin, setFilterStatusMin] = useState<string>("")
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("per_page", "50")
      if (filterEmail) params.append("user_email", filterEmail)
      if (filterAction) params.append("action_type", filterAction)
      if (filterResource) params.append("resource_type", filterResource)
      if (filterStatusMin) params.append("status_min", filterStatusMin)
      if (filterDateFrom) params.append("date_from", filterDateFrom)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`${API_BASE}/api/admin/access-logs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch logs")
      const data = await response.json()
      
      setLogs(data.data || [])
      setTotalCount(data.total || 0)
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      setLogs([])
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/access-logs/stats?days=7`)
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data.data || [])
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [currentPage, filterEmail, filterAction, filterResource, filterStatusMin, filterDateFrom, searchQuery])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchLogs()
    }, 10000) // 10秒ごと
    return () => clearInterval(interval)
  }, [autoRefresh, currentPage, filterEmail, filterAction, filterResource, filterStatusMin, filterDateFrom, searchQuery])

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-zinc-700 text-zinc-300"
      case "POST": return "bg-white text-zinc-950"
      case "PUT": return "bg-zinc-600 text-white"
      case "DELETE": return "bg-zinc-900 text-white border border-white"
      default: return "bg-zinc-800 text-zinc-400"
    }
  }

  const getStatusBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-zinc-700 text-white"
    if (status >= 400 && status < 500) return "bg-zinc-600 text-white"
    if (status >= 500) return "bg-zinc-900 text-white border border-white"
    return "bg-zinc-800 text-zinc-400"
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 pb-24">
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-400">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-24">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">アクセスログ</h1>
              <p className="text-sm text-zinc-400 mt-1">全アクティビティの記録と分析</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "text-white" : "text-zinc-400"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "自動更新中" : "自動更新"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchLogs()
                fetchStats()
              }}
              className="text-zinc-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </div>

        {/* 統計カード */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-400" />
                <span className="text-xs text-zinc-400">総リクエスト</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {stats.reduce((sum, s) => sum + s.total_requests, 0).toLocaleString()}
              </p>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-zinc-400" />
                <span className="text-xs text-zinc-400">ユニークユーザー</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {Math.max(...stats.map(s => s.unique_users))}
              </p>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-zinc-400" />
                <span className="text-xs text-zinc-400">エラー数</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {stats.reduce((sum, s) => sum + s.error_count, 0)}
              </p>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-400" />
                <span className="text-xs text-zinc-400">平均応答時間</span>
              </div>
              <p className="text-2xl font-bold text-white mt-2">
                {Math.round(stats.reduce((sum, s) => sum + s.avg_response_time_ms, 0) / stats.length)} ms
              </p>
            </Card>
          </div>
        )}

        {/* フィルター */}
        <Card className="border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-semibold text-white">フィルター</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="メールアドレス検索"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="border-zinc-800 bg-zinc-950 text-white">
                <SelectValue placeholder="アクション種別" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900">
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="view">view</SelectItem>
                <SelectItem value="create">create</SelectItem>
                <SelectItem value="update">update</SelectItem>
                <SelectItem value="delete">delete</SelectItem>
                <SelectItem value="login">login</SelectItem>
                <SelectItem value="export">export</SelectItem>
                <SelectItem value="error">error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger className="border-zinc-800 bg-zinc-950 text-white">
                <SelectValue placeholder="リソース種別" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900">
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="cast">キャスト</SelectItem>
                <SelectItem value="shop">店舗</SelectItem>
                <SelectItem value="scout">スカウト</SelectItem>
                <SelectItem value="interview">面接</SelectItem>
                <SelectItem value="salary">給料</SelectItem>
                <SelectItem value="system">システム</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <Input
              type="number"
              placeholder="最小ステータスコード"
              value={filterStatusMin}
              onChange={(e) => setFilterStatusMin(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
            <Input
              type="datetime-local"
              placeholder="開始日時"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
            <Input
              placeholder="キーワード検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
            />
          </div>
          {(filterEmail || filterAction || filterResource || filterStatusMin || filterDateFrom || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterEmail("")
                setFilterAction("")
                setFilterResource("")
                setFilterStatusMin("")
                setFilterDateFrom("")
                setSearchQuery("")
              }}
              className="mt-3 text-zinc-400 hover:text-white"
            >
              フィルターをクリア
            </Button>
          )}
        </Card>

        {/* ログテーブル */}
        <Card className="border-zinc-800 bg-zinc-900">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-semibold text-white">
                  アクセスログ（全 {totalCount.toLocaleString()} 件）
                </span>
              </div>
              <span className="text-xs text-zinc-500">ページ {currentPage} / {totalPages}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-400">
                  <th className="p-3 text-left font-medium">日時</th>
                  <th className="p-3 text-left font-medium">ユーザー</th>
                  <th className="p-3 text-left font-medium">メソッド</th>
                  <th className="p-3 text-left font-medium">パス</th>
                  <th className="p-3 text-left font-medium">アクション</th>
                  <th className="p-3 text-left font-medium">ステータス</th>
                  <th className="p-3 text-left font-medium">応答時間</th>
                  <th className="p-3 text-left font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500">
                      ログがありません
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="p-3 text-xs text-zinc-400">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-white">{log.user_email || "(未認証)"}</div>
                        <div className="text-xs text-zinc-500">{log.user_role}</div>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${getMethodBadgeColor(log.request_method)}`}>
                          {log.request_method}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-zinc-300 max-w-xs truncate">
                        {log.request_path}
                      </td>
                      <td className="p-3">
                        <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                          {log.action_type}
                        </Badge>
                        {log.resource_type && (
                          <Badge className="ml-1 bg-zinc-700 text-zinc-400 text-xs">
                            {log.resource_type}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${getStatusBadgeColor(log.response_status)}`}>
                          {log.response_status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-zinc-400">
                        {log.response_time_ms} ms
                      </td>
                      <td className="p-3 text-xs text-zinc-500">
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="text-zinc-400 hover:text-white disabled:opacity-30"
              >
                前へ
              </Button>
              <span className="text-xs text-zinc-500">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="text-zinc-400 hover:text-white disabled:opacity-30"
              >
                次へ
              </Button>
            </div>
          )}
        </Card>

        {/* 日別統計 */}
        {stats.length > 0 && (
          <Card className="border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-semibold text-white">日別統計（直近7日間）</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="p-2 text-left font-medium">日付</th>
                    <th className="p-2 text-right font-medium">総リクエスト</th>
                    <th className="p-2 text-right font-medium">ユーザー数</th>
                    <th className="p-2 text-right font-medium">ログイン</th>
                    <th className="p-2 text-right font-medium">作成</th>
                    <th className="p-2 text-right font-medium">更新</th>
                    <th className="p-2 text-right font-medium">削除</th>
                    <th className="p-2 text-right font-medium">エラー</th>
                    <th className="p-2 text-right font-medium">平均応答</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.log_date} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                      <td className="p-2 text-white">{stat.log_date}</td>
                      <td className="p-2 text-right text-white">{stat.total_requests.toLocaleString()}</td>
                      <td className="p-2 text-right text-zinc-300">{stat.unique_users}</td>
                      <td className="p-2 text-right text-zinc-400">{stat.login_count}</td>
                      <td className="p-2 text-right text-zinc-400">{stat.create_count}</td>
                      <td className="p-2 text-right text-zinc-400">{stat.update_count}</td>
                      <td className="p-2 text-right text-zinc-400">{stat.delete_count}</td>
                      <td className="p-2 text-right text-white">{stat.error_count}</td>
                      <td className="p-2 text-right text-zinc-400">{stat.avg_response_time_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
