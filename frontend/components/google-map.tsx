'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  markerTitle?: string;
  className?: string;
}

export function GoogleMap({ lat, lng, zoom = 15, markerTitle = '店舗', className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
      setError('Google Maps APIキーが設定されていません');
      setLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    loader
      .importLibrary('maps')
      .then(({ Map }) => {
        loader.importLibrary('marker').then(({ Marker }) => {
          const map = new Map(mapRef.current!, {
            center: { lat, lng },
            zoom,
            mapId: 'smartnr-map',
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
          new Marker({
            position: { lat, lng },
            map,
            title: markerTitle,
          });

          setLoading(false);
        });
      })
      .catch((err) => {
        console.error('Google Maps読み込みエラー:', err);
        setError('地図の読み込みに失敗しました');
        setLoading(false);
      });
  }, [lat, lng, zoom, markerTitle]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-800/50 rounded-lg ${className}`}>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg z-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-[#00C4CC]" />
        </div>
      )}
      <div ref={mapRef} className={className} />
    </div>
  );
}
