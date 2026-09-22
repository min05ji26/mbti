// Booth info — these were editable props in the Claude Design prototype ("부스 정보" section).
// Edit here before publishing for a real booth.

export const BOOTH = {
  orgName: '유니콘',
  boothName: '부스 이름',
  boothDate: '10월 24일',
  boothTime: '11:00~16:00',
  boothPlace: '인천광역시 미추홀구 숙골로88번길 12, 앨리웨이',
  freebie: '굿즈 키링',
  // 지도에 마커를 찍을 좌표. 정확한 값이 필요하면 네이버 지도에서 주소 검색 →
  // 지도 우클릭 > "이 위치의 좌표"로 확인해서 바꿔주세요. (지금은 대략적인 위치)
  boothLat: 37.4482,
  boothLng: 126.6472,
};

export type BoothConfig = typeof BOOTH;

// 네이버 지도 API 클라이언트 ID 
export const NAVER_MAP_CLIENT_ID = 'c793v9qnzm';
