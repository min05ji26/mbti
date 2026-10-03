// Booth info — these were editable props in the Claude Design prototype ("부스 정보" section).
// Edit here before publishing for a real booth.

export const BOOTH = {
  orgName: '유니콘',
  boothName: '부스 이름',
  boothDate: '10월 24일',
  boothTime: '11:00~14:30',
  boothPlace: '인천광역시 미추홀구 숙골로88번길 12, 앨리웨이',
  freebie: '굿즈 키링',
  // 지도에 마커를 찍을 좌표 — 숙골로88번길 12 (앨리웨이 인천)
  boothLat: 37.469546,
  boothLng: 126.664546,
};

export type BoothConfig = typeof BOOTH;

// 지도 미리보기를 눌렀을 때 열릴 네이버 지도 링크 (도로명 주소로 검색해 정확한 위치로 이동)
export const BOOTH_NAVER_MAP_URL = `https://map.naver.com/p/search/${encodeURIComponent(BOOTH.boothPlace.split(',')[0])}`;

// 네이버 지도 API 클라이언트 ID — 값은 커밋되지 않는 .env 파일에 둡니다.
// 프로젝트 루트에 .env 파일을 만들고 VITE_NAVER_MAP_CLIENT_ID=발급받은값 을 적어주세요. (.env.example 참고)
export const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? '';
