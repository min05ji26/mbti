import { useEffect, useRef, useState } from 'react';
import { NAVER_MAP_CLIENT_ID } from '../config';

declare global {
  interface Window {
    naver?: any;
  }
}

let scriptLoad: Promise<void> | null = null;

function loadNaverMapsScript(clientId: string): Promise<void> {
  if (window.naver?.maps) return Promise.resolve();
  if (!scriptLoad) {
    scriptLoad = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('naver maps script load failed'));
      document.head.appendChild(script);
    });
  }
  return scriptLoad;
}

export default function NaverMap({ lat, lng, height = 240 }: { lat: number; lng: number; height?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'no-key' | 'error'>('loading');

  useEffect(() => {
    if (!NAVER_MAP_CLIENT_ID) {
      setStatus('no-key');
      return;
    }
    let cancelled = false;
    loadNaverMapsScript(NAVER_MAP_CLIENT_ID)
      .then(() => {
        if (cancelled || !boxRef.current) return;
        const center = new window.naver.maps.LatLng(lat, lng);
        const map = new window.naver.maps.Map(boxRef.current, { center, zoom: 16 });
        new window.naver.maps.Marker({ position: center, map });
        setStatus('ok');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (status === 'no-key' || status === 'error') {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 16,
          background: 'repeating-linear-gradient(135deg, #FFF1C9 0 10px, #FFF7EC 10px 20px)',
          font: "700 12px/1.6 'Gothic A1'",
          color: '#7a6a3f',
        }}
      >
        {status === 'no-key'
          ? <>지도 API 키가 아직 등록되지 않았어요.<br />src/config.ts의 NAVER_MAP_CLIENT_ID를 채워주세요.</>
          : <>지도를 불러오지 못했어요.<br />API 키 또는 등록된 서비스 URL을 확인해주세요.</>}
      </div>
    );
  }

  return <div ref={boxRef} style={{ width: '100%', height }} />;
}
