'use client';

import { useState, useEffect } from 'react';
import { Search, User, Store, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  type: 'cast' | 'shop';
  subtitle?: string;
  tags?: string[];
}

// ダミーデータ
const mockCasts = [
  { id: '1', name: 'あやか', age: 22, tags: ['清楚系', 'スレンダー'] },
  { id: '2', name: 'みゆき', age: 24, tags: ['ギャル系', 'グラマー'] },
  { id: '3', name: 'さくら', age: 21, tags: ['お姉さん系', 'スレンダー'] },
  { id: '4', name: 'りな', age: 23, tags: ['癒し系', 'ぽっちゃり'] },
];

const mockShops = [
  { id: '1', name: 'CLUB ELEGANCE', area: '祇園' },
  { id: '2', name: 'BAR MIRAGE', area: '木屋町' },
  { id: '3', name: 'LOUNGE CRYSTAL', area: '先斗町' },
];

export function SearchPopover() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    
    // キャスト検索
    const castResults: SearchResult[] = mockCasts
      .filter((cast) => cast.name.toLowerCase().includes(searchQuery))
      .map((cast) => ({
        id: cast.id,
        name: cast.name,
        type: 'cast' as const,
        subtitle: `${cast.age}歳`,
        tags: cast.tags,
      }));

    // 店舗検索
    const shopResults: SearchResult[] = mockShops
      .filter((shop) => shop.name.toLowerCase().includes(searchQuery))
      .map((shop) => ({
        id: shop.id,
        name: shop.name,
        type: 'shop' as const,
        subtitle: shop.area,
      }));

    setResults([...castResults, ...shopResults]);
  }, [query]);

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="キャスト名・店舗名で検索..."
            className="w-full bg-slate-800 pl-10 pr-10 focus-visible:ring-1 focus-visible:ring-[#00C4CC]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      
      {query && results.length > 0 && (
        <PopoverContent 
          className="w-[400px] border-slate-800 bg-slate-900 p-0" 
          align="start"
          sideOffset={8}
        >
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-slate-400">
                検索結果 ({results.length}件)
              </div>
              
              {/* キャスト結果 */}
              {results.some((r) => r.type === 'cast') && (
                <div className="mt-2">
                  <div className="px-2 py-1 text-xs font-medium text-slate-500">
                    キャスト
                  </div>
                  {results
                    .filter((r) => r.type === 'cast')
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={`/casts/${result.id}`}
                        onClick={handleSelect}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-slate-800 transition-colors group"
                      >
                        <div 
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: 'rgba(0, 196, 204, 0.2)' }}
                        >
                          <User className="h-4 w-4" style={{ color: '#00C4CC' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate group-hover:text-[#00C4CC] transition-colors">
                              {result.name}
                            </p>
                            {result.subtitle && (
                              <span className="text-xs text-slate-500">
                                {result.subtitle}
                              </span>
                            )}
                          </div>
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {result.tags.slice(0, 2).map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 h-5"
                                  style={{
                                    borderColor: 'rgba(0, 196, 204, 0.3)',
                                    backgroundColor: 'rgba(0, 196, 204, 0.1)',
                                    color: '#00C4CC',
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              )}

              {/* 店舗結果 */}
              {results.some((r) => r.type === 'shop') && (
                <div className="mt-3">
                  <div className="px-2 py-1 text-xs font-medium text-slate-500">
                    店舗
                  </div>
                  {results
                    .filter((r) => r.type === 'shop')
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={`/stores/${result.id}`}
                        onClick={handleSelect}
                        className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-slate-800 transition-colors group"
                      >
                        <div 
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: 'rgba(156, 163, 175, 0.2)' }}
                        >
                          <Store className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-[#00C4CC] transition-colors">
                            {result.name}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      )}

      {query && results.length === 0 && (
        <PopoverContent 
          className="w-[400px] border-slate-800 bg-slate-900 p-0" 
          align="start"
          sideOffset={8}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Search className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-400">
              「{query}」に一致する結果が見つかりませんでした
            </p>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
