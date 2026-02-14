'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markerTitle?: string;
  className?: string;
}

export function GoogleMap({ lat, lng, zoom = 15, markerTitle = '店舗', className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      setError('Google Maps APIキーが設定されていません');
      return;
    }

    // Google Maps JavaScript APIを動的に読み込み
    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => setError('地図の読み込みに失敗しました');
      document.head.appendChild(script);
    } else if (window.google) {
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !window.google) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#283d4a' }],
          },
        ],
      });

      // マーカーを追加
      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: markerTitle,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#00C4CC',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    }
  }, [lat, lng, zoom, markerTitle]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-800/50 rounded-lg ${className}`}>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
}

// TypeScript定義
declare global {
  interface Window {
    google: any;
  }
}
