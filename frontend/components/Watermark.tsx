'use client';

import { useEffect, useState } from 'react';

export function Watermark() {
  const [currentTime, setCurrentTime] = useState('');
  const userName = '京極 蓮'; // TODO: 将来的にはSupabase認証から取得

  useEffect(() => {
    // 初回レンダリング時の時刻を設定
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${year}/${month}/${day} ${hours}:${minutes}`);
    };

    updateTime();
    
    // 1分ごとに時刻を更新
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // SVGパターンを生成（テキストを斜めにリピート）
  const watermarkText = `${userName} ${currentTime}`;
  
  // SVGをData URIに変換してbackground-imageとして使用
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 200 150)"
        font-family="sans-serif"
        font-size="16"
        fill="rgb(148, 163, 184)"
        fill-opacity="0.08"
      >
        ${watermarkText}
      </text>
    </svg>
  `.trim();

  const encodedSvg = encodeURIComponent(svgString);
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      style={{
        backgroundImage: `url("${dataUri}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 300px',
      }}
      aria-hidden="true"
    />
  );
}
