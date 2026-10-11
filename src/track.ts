// 방문/이용 지표 수집 — /api/track 으로 이벤트를 조용히 보낸다.
// 개인정보는 보내지 않음: 탭마다 새로 만드는 랜덤 세션 ID + 이벤트 이름 + 동물 키 정도만.
// 실패해도 앱 동작에는 절대 영향 없게 전부 try/catch, 응답도 기다리지 않음.

const ENDPOINT = '/api/track';
// 로컬 개발(npm run dev)에서는 서버 함수가 없어서 보내지 않음
const ENABLED = !import.meta.env.DEV;

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function sessionId() {
  try {
    let id = sessionStorage.getItem('sid');
    if (!id) {
      id = makeId();
      sessionStorage.setItem('sid', id);
    }
    return id;
  } catch {
    return fallbackSid;
  }
}
const fallbackSid = makeId();
const startedAt = Date.now();

export function track(event: string, label = '', value = 0) {
  if (!ENABLED) return;
  try {
    const body = JSON.stringify({ e: event, l: label, v: value, s: sessionId() });
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
    fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } }).catch(() => {});
  } catch {
    /* 지표 수집 실패는 무시 */
  }
}

// 페이지를 떠나거나 백그라운드로 갈 때 체류시간(초)을 기록 — 세션당 가장 마지막 값이 최종 체류시간
let lastSent = 0;
export function initTracking() {
  if (!ENABLED) return;
  let ref = 'direct';
  try {
    if (document.referrer) ref = new URL(document.referrer).hostname;
  } catch {
    /* 이상한 referrer는 direct 취급 */
  }
  track('visit', ref);
  const sendDwell = () => {
    const sec = Math.round((Date.now() - startedAt) / 1000);
    if (sec - lastSent < 2) return;
    lastSent = sec;
    track('dwell', '', sec);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendDwell();
  });
  window.addEventListener('pagehide', sendDwell);
}
