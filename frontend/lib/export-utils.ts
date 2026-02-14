import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * データをCSV形式でエクスポート
 */
export function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

/**
 * データをExcel形式でエクスポート
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * 複数シートのExcelをエクスポート
 */
export function exportMultiSheetExcel(
  sheets: { name: string; data: any[] }[],
  filename: string
) {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * キャストデータのフォーマット
 */
export function formatCastDataForExport(casts: any[]) {
  return casts.map((cast) => ({
    'ID': cast.id,
    '名前': cast.name,
    '年齢': cast.age,
    '身長': cast.height ? `${cast.height}cm` : '-',
    '体型': cast.body_type || '-',
    '髪型': cast.hairstyle || '-',
    '雰囲気タグ': Array.isArray(cast.tags) ? cast.tags.join(', ') : '-',
    '希望エリア': cast.preferred_area || '-',
    '希望時給': cast.desired_hourly_wage ? `¥${cast.desired_hourly_wage.toLocaleString()}` : '-',
    '経験': cast.experience || '-',
    '登録日': cast.created_at ? new Date(cast.created_at).toLocaleDateString('ja-JP') : '-',
  }));
}

/**
 * 給料データのフォーマット
 */
export function formatSalaryDataForExport(salaries: any[]) {
  return salaries.map((salary) => ({
    'ID': salary.id,
    'スカウト名': salary.scout_name,
    'キャスト名': salary.cast_name,
    '店舗名': salary.shop_name,
    '勤務期間': salary.work_period,
    '基本報酬': `¥${salary.base_amount.toLocaleString()}`,
    'ボーナス': `¥${salary.bonus_amount.toLocaleString()}`,
    '合計金額': `¥${salary.total_amount.toLocaleString()}`,
    'ステータス': salary.status === 'approved' ? '承認済み' : salary.status === 'pending' ? '申請中' : '却下',
    '申請日': salary.created_at ? new Date(salary.created_at).toLocaleDateString('ja-JP') : '-',
  }));
}

/**
 * 面接データのフォーマット
 */
export function formatInterviewDataForExport(interviews: any[]) {
  return interviews.map((interview) => ({
    'ID': interview.id,
    'キャスト名': interview.cast_name,
    '面接日時': interview.interview_date ? new Date(interview.interview_date).toLocaleString('ja-JP') : '-',
    '場所': interview.location,
    'ステータス': interview.status === 'scheduled' ? '予定' : interview.status === 'confirmed' ? '確定' : interview.status === 'completed' ? '完了' : 'キャンセル',
    'メモ': interview.note || '-',
    '登録日': interview.created_at ? new Date(interview.created_at).toLocaleDateString('ja-JP') : '-',
  }));
}

/**
 * 月次レポートのエクスポート
 */
export function exportMonthlyReport(data: {
  casts: any[];
  salaries: any[];
  interviews: any[];
}, month: string) {
  const sheets = [
    {
      name: 'キャスト一覧',
      data: formatCastDataForExport(data.casts),
    },
    {
      name: '給料申請',
      data: formatSalaryDataForExport(data.salaries),
    },
    {
      name: '面接予定',
      data: formatInterviewDataForExport(data.interviews),
    },
  ];

  exportMultiSheetExcel(sheets, `月次レポート_${month}`);
}

/**
 * JSONデータをエクスポート（バックアップ用）
 */
export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
}

/**
 * ファイル名の生成（タイムスタンプ付き）
 */
export function generateFilename(baseName: string): string {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0].replace(/-/g, '');
  return `${baseName}_${timestamp}`;
}
