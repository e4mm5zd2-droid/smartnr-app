'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  formatCastDataForExport,
  formatSalaryDataForExport,
  formatInterviewDataForExport,
  generateFilename,
} from '@/lib/export-utils';

interface ExportMenuProps {
  data: any[];
  type: 'casts' | 'salaries' | 'interviews';
  label?: string;
}

export function ExportMenu({ data, type, label }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getFormattedData = () => {
    switch (type) {
      case 'casts':
        return formatCastDataForExport(data);
      case 'salaries':
        return formatSalaryDataForExport(data);
      case 'interviews':
        return formatInterviewDataForExport(data);
      default:
        return data;
    }
  };

  const getBaseFilename = () => {
    const names = {
      casts: 'キャスト一覧',
      salaries: '給料データ',
      interviews: '面接予定',
    };
    return generateFilename(names[type]);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    setIsExporting(true);

    try {
      const formattedData = getFormattedData();
      const filename = getBaseFilename();

      switch (format) {
        case 'csv':
          exportToCSV(formattedData, filename);
          break;
        case 'excel':
          exportToExcel(formattedData, filename);
          break;
        case 'json':
          exportToJSON(data, filename);
          break;
      }

      // エクスポート成功の通知（オプション）
      console.log(`${format.toUpperCase()}エクスポート完了: ${filename}`);
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました。もう一度お試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700"
          disabled={isExporting || data.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {label || 'エクスポート'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-slate-800 bg-slate-900">
        <DropdownMenuLabel>形式を選択</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-400" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4 text-blue-400" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleExport('json')}
          className="cursor-pointer"
        >
          <Database className="mr-2 h-4 w-4 text-purple-400" />
          <span>JSON (.json)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
