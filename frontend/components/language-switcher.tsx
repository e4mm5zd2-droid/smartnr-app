'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState('ja');

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    // ローカルストレージに保存
    localStorage.setItem('language', langCode);
    // ページリロード（将来的にはnext-intlで動的切り替え）
    window.location.reload();
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="h-5 w-5" />
          <span className="sr-only">言語切り替え</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 border-slate-800 bg-slate-900">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              currentLang === language.code
                ? 'bg-slate-800'
                : 'hover:bg-slate-800'
            }`}
          >
            <span className="mr-2 text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {currentLang === language.code && (
              <span className="ml-auto text-xs" style={{ color: '#00C4CC' }}>
                ✓
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
