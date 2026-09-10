# 슬라임 부스 심리테스트 (프론트엔드)

Claude Design 프로토타입 `Slime Test.dc.html` 을 React + Vite + TypeScript 로 옮긴
청소년 심리테스트 부스 웹앱입니다. 모바일 우선(최대 폭 430px), 정적 배포용.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 정적 파일 생성
npm run preview  # 빌드 결과 미리보기
```

빌드 결과(`dist/`)는 Vercel · Netlify · Cloudflare Pages · GitHub Pages 등
아무 정적 호스팅에나 올리면 됩니다. 서버 로직이 없어 트래픽이 몰려도
CDN 캐시로 처리됩니다. `vite.config.ts` 의 `base: './'` 덕분에 서브경로 배포도 OK.

## 화면 (9개, 모두 클라이언트 상태로 전환)

| 화면 | 설명 |
|---|---|
| home | 인트로 · 마스코트 4종 자동 회전 |
| quiz | 질문 6개, 보기 4개 (선택 즉시 다음 문항) |
| loading | 결과 계산 중 (1.6초) |
| result | 동물 유형 결과 + 초대장 카드 + 하단 4개 메뉴 |
| invite | 초대장 단독 보기 |
| signup | 사전 신청 폼 (localStorage 저장) |
| map | 부스 위치 (지도 이미지 자리) |
| compare | 친구 유형 골라 궁합 보기 |
| stats | 유형별 통계 막대 (예시 수치) |

## 구조

```
src/
  main.tsx              진입점
  index.css             폰트 · 전역 스타일 · @keyframes (디자인 원본에서 이식)
  config.ts             부스 정보 (기관명/날짜/장소/굿즈) — 실제 부스에 맞게 수정
  data.ts               유형 4종 · 질문 6개 · 궁합표 · 통계 (원본 그대로)
  useTest.ts            테스트 상태/흐름 훅 (screen, 점수 집계, 결과 산출)
  components/
    AnimalCharacter.tsx CSS 아트 마스코트 (dog/cat/rabbit/fox, scale prop 지원)
  App.tsx               프레임(오로라 배경) + 9개 화면 컴포넌트
```

## 실제 부스 적용 전 체크리스트

- `src/config.ts` — `boothName` / `boothTime` / `boothPlace` 등 실제 값 입력
- `src/App.tsx` 의 로고 자리(`repeating-linear-gradient` placeholder) → 실제 로고 이미지
- `MapScreen` 의 "지도 이미지 자리" → 약도 이미지
- 통계(`STATS`) 와 `유형 통계` 화면의 `1,284명` 은 예시값 — 집계 백엔드 붙이거나 문구 조정
- `입장 코드` 규칙(`UNI-1024-<TYPE>`) 확인 (`useTest.ts` 의 `entryCode`)
- 결과 "이미지 저장" 은 현재 토스트만 표시 — 실제 캡처가 필요하면 `html-to-image` 등 추가

## 원본 대비 차이

- DC 프로토타입 런타임(`support.js`)은 이식하지 않음 (디자인 툴 전용)
- 상태 관리는 단일 클래스 컴포넌트 → `useTest` 훅으로 재구성 (동작·수치는 동일)
- 접근성: `prefers-reduced-motion` 시 애니메이션 최소화 추가
