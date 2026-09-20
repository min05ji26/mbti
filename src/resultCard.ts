import { ANIMAL_IMAGES } from './animalImages';
import { BOOTH } from './config';
import { KW_BG, KW_INK, TYPES, type AnimalType } from './data';

// 결과 화면을 사진첩/다운로드용 PNG 카드로 그림.
// DOM 캡처 라이브러리 대신 canvas에 직접 그려서 iOS 사파리에서도 폰트/이미지가 깨지지 않게 함.
// 좌표는 360px 폭 기준으로 잡고 3배(1080px)로 출력.

const W = 360;
const SCALE = 3;
const INK = '#2E2A4D';
const GOTHIC = "'Gothic A1', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
const JUA = "'Jua', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

const HEADER_BADGE = `${BOOTH.orgName} · 체험 부스 심리테스트`;
const HEADER_TITLE = '내 성격이 동물이면 어떤 애일까?';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image load failed: ${src}`));
    img.src = src;
  });
}

// 구글 폰트는 글자 범위별로 쪼개서 받기 때문에, 카드에 들어갈 글자를 넘겨서 그 조각까지 받아둠
async function loadFonts(text: string) {
  if (!document.fonts) return;
  const wait = Promise.all([
    document.fonts.load(`30px Jua`, text),
    document.fonts.load(`500 14px 'Gothic A1'`, text),
    document.fonts.load(`700 14px 'Gothic A1'`, text),
    document.fonts.load(`800 14px 'Gothic A1'`, text),
  ]).catch(() => undefined);
  // 오프라인 등으로 폰트가 안 오면 기본 폰트로라도 그림
  await Promise.race([wait, new Promise((r) => setTimeout(r, 2500))]);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    // 한 단어가 한 줄보다 길면 글자 단위로 자름
    line = '';
    for (const ch of word) {
      if (line && ctx.measureText(line + ch).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line += ch;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.save();
  // shadow 값은 transform(scale)의 영향을 안 받아서 직접 곱해줌
  ctx.shadowColor = 'rgba(76,64,150,.13)';
  ctx.shadowBlur = 24 * SCALE;
  ctx.shadowOffsetY = 8 * SCALE;
  ctx.fillStyle = 'rgba(255,255,255,.94)';
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

function drawContain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const ratio = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * ratio;
  const dh = img.naturalHeight * ratio;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function drawSpacedCentered(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = 'center';
}

function blob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rgb: string, alpha: number) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.7, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

export async function makeResultCard(res: AnimalType): Promise<Blob> {
  const best = TYPES[res.best];
  await loadFonts(
    [res.species, res.tagline, res.name, res.sub, res.desc, ...res.keywords, best.name, best.species, '환상의 짝꿍 MY ANIMAL TYPE ·', HEADER_BADGE, HEADER_TITLE].join(''),
  );
  const [mainImg, bestImg] = await Promise.all([
    loadImage(ANIMAL_IMAGES[res.key]),
    loadImage(ANIMAL_IMAGES[res.best]),
  ]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas not supported');

  /* ---- 1) 글 길이에 따라 높이 계산 ---- */
  const CARD_X = 20;
  const CARD_W = W - CARD_X * 2;
  const PAD = 20;
  const DESC_LH = 23;
  const CHIP_H = 28;
  const CHIP_GAP = 8;

  ctx.font = `500 14px ${GOTHIC}`;
  const descLines = wrapText(ctx, res.desc, CARD_W - PAD * 2);

  ctx.font = `800 12.5px ${GOTHIC}`;
  const chipRows: { text: string; w: number; i: number }[][] = [[]];
  let rowW = 0;
  res.keywords.forEach((text, i) => {
    const w = ctx.measureText(text).width + 26;
    const row = chipRows[chipRows.length - 1];
    if (row.length && rowW + CHIP_GAP + w > CARD_W - PAD * 2) {
      chipRows.push([]);
      rowW = 0;
    }
    chipRows[chipRows.length - 1].push({ text, w, i });
    rowW += (rowW ? CHIP_GAP : 0) + w;
  });

  // 맨 위 헤더(유니콘 배지 + 제목 + 구분선)만큼 캐릭터 이하를 아래로 내림
  const TOP = 128;
  const descTop = TOP + 334;
  const descH = PAD + descLines.length * DESC_LH + 14 + chipRows.length * CHIP_H + (chipRows.length - 1) * CHIP_GAP + PAD;
  const bestTop = descTop + descH + 12;
  const BEST_H = 80;
  const H = Math.max(640, bestTop + BEST_H + 30);

  canvas.width = W * SCALE;
  canvas.height = Math.round(H * SCALE);
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';

  /* ---- 2) 배경 (앱 배경과 같은 그라데이션 + 오로라) ---- */
  const rad = (168 * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = Math.abs((W / 2) * dx) + Math.abs((H / 2) * dy);
  const bg = ctx.createLinearGradient(W / 2 - dx * half, H / 2 - dy * half, W / 2 + dx * half, H / 2 + dy * half);
  bg.addColorStop(0, '#E8F3FF');
  bg.addColorStop(0.46, '#EDE9FE');
  bg.addColorStop(1, '#F6E9FB');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  blob(ctx, 60, 40, 190, '120,190,255', 0.55);
  blob(ctx, W + 25, 300, 180, '186,146,255', 0.5);
  blob(ctx, 90, H - 30, 170, '126,231,222', 0.4);

  /* ---- 3) 맨 위 헤더: 유니콘 배지 + 테스트 제목 ---- */
  ctx.font = `800 13px ${GOTHIC}`;
  const badgeW = ctx.measureText(HEADER_BADGE).width + 44;
  const badgeX = (W - badgeW) / 2;
  ctx.fillStyle = INK;
  roundRect(ctx, badgeX, 26, badgeW, 30, 15);
  ctx.fill();
  ctx.fillStyle = '#7EE7DE';
  ctx.beginPath();
  ctx.arc(badgeX + 17, 41, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#F3F0FF';
  ctx.textAlign = 'left';
  ctx.fillText(HEADER_BADGE, badgeX + 28, 34);
  ctx.textAlign = 'center';

  ctx.fillStyle = INK;
  ctx.font = `24px ${JUA}`;
  ctx.fillText(HEADER_TITLE, W / 2, 68);

  // - - - MY ANIMAL TYPE - - -  구분선
  ctx.font = `800 11px ${GOTHIC}`;
  const label = 'MY ANIMAL TYPE';
  const labelHalf = (ctx.measureText(label).width + 1.6 * (label.length - 1)) / 2 + 10;
  ctx.strokeStyle = 'rgba(108,92,231,.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(CARD_X, 111);
  ctx.lineTo(W / 2 - labelHalf, 111);
  ctx.moveTo(W / 2 + labelHalf, 111);
  ctx.lineTo(W - CARD_X, 111);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(46,42,77,.45)';
  drawSpacedCentered(ctx, label, W / 2, 105, 1.6);

  /* ---- 4) 캐릭터 + 이름 ---- */
  drawContain(ctx, mainImg, (W - 184) / 2, TOP, 184, 230);

  ctx.fillStyle = res.ink;
  ctx.font = `800 13px ${GOTHIC}`;
  ctx.fillText(`${res.species} · ${res.tagline}`, W / 2, TOP + 240);

  ctx.fillStyle = INK;
  ctx.font = `31px ${JUA}`;
  ctx.fillText(res.name, W / 2, TOP + 262);

  ctx.fillStyle = 'rgba(46,42,77,.62)';
  ctx.font = `700 14px ${GOTHIC}`;
  ctx.fillText(res.sub, W / 2, TOP + 304);

  /* ---- 5) 설명 + 키워드 카드 ---- */
  fillCard(ctx, CARD_X, descTop, CARD_W, descH, 24);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#3D3860';
  ctx.font = `500 14px ${GOTHIC}`;
  descLines.forEach((l, i) => ctx.fillText(l, CARD_X + PAD, descTop + PAD + 3 + i * DESC_LH));

  ctx.font = `800 12.5px ${GOTHIC}`;
  let chipY = descTop + PAD + descLines.length * DESC_LH + 14;
  chipRows.forEach((row) => {
    let chipX = CARD_X + PAD;
    row.forEach(({ text, w, i }) => {
      ctx.fillStyle = KW_BG[i % KW_BG.length];
      roundRect(ctx, chipX, chipY, w, CHIP_H, CHIP_H / 2);
      ctx.fill();
      ctx.fillStyle = KW_INK[i % KW_INK.length];
      ctx.fillText(text, chipX + 13, chipY + 8);
      chipX += w + CHIP_GAP;
    });
    chipY += CHIP_H + CHIP_GAP;
  });

  /* ---- 6) 환상의 짝꿍 ---- */
  fillCard(ctx, CARD_X, bestTop, CARD_W, BEST_H, 20);
  drawContain(ctx, bestImg, CARD_X + 14, bestTop + 8, 51, 64);
  ctx.fillStyle = 'rgba(46,42,77,.48)';
  ctx.font = `800 11px ${GOTHIC}`;
  ctx.fillText('환상의 짝꿍', CARD_X + 78, bestTop + 22);
  ctx.fillStyle = INK;
  ctx.font = `18px ${JUA}`;
  ctx.fillText(best.name, CARD_X + 78, bestTop + 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = best.ink;
  ctx.font = `800 12px ${GOTHIC}`;
  ctx.fillText(best.species, CARD_X + CARD_W - 18, bestTop + 34);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

/* ================= 공유 ================= */

export type ShareOutcome = 'shared' | 'cancelled' | 'unsupported';

// 카드 이미지 파일 자체를 공유 시트로 보냄 (카톡/인스타/메시지 등).
// 링크는 text에 같이 넣음 — 파일과 url 필드를 같이 주면 url을 버리는 앱이 많음
export async function shareCard(blob: Blob, filename: string, text: string): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (!navigator.canShare?.({ files: [file] })) return 'unsupported';
  try {
    await navigator.share({ files: [file], text });
    return 'shared';
  } catch (e) {
    if ((e as DOMException).name === 'AbortError') return 'cancelled';
    return 'unsupported';
  }
}

/* ================= 저장 (기기별 분기) ================= */

export type SaveOutcome = 'saved' | 'cancelled' | 'preview';

function isIOS() {
  const ua = navigator.userAgent;
  // iPadOS 13+는 데스크톱 사파리 UA를 쓰므로 터치 여부로 구분
  return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isInAppBrowser() {
  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\/|DaumApps|everytimeApp|SamsungBrowser\/.*CrossApp/i.test(navigator.userAgent);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// - iOS: 다운로드하면 '파일' 앱으로 가버려서, 공유 시트의 "이미지 저장"으로 사진첩에 넣음.
//        (웹페이지가 사진첩에 바로 넣는 방법은 없음 — 이 한 번의 탭은 iOS가 강제하는 것)
//        시트가 공유 버튼 눌렀을 때랑 똑같이 생겨서 헷갈리므로,
//        시트가 뜨기 직전에 onShareSheet로 "이미지 저장을 눌러줘" 안내를 띄운다.
// - 안드로이드/PC: 바로 PNG 다운로드 (안드로이드는 갤러리 > Download 폴더에 보임)
// - 카톡/인스타 등 인앱 브라우저: 저장이 막혀 있는 경우가 많아서 이미지 띄우고 꾹 눌러 저장하게 안내
export async function saveCard(blob: Blob, filename: string, onShareSheet?: () => void): Promise<SaveOutcome> {
  if (isIOS()) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        onShareSheet?.();
        await navigator.share({ files: [file] });
        return 'saved';
      } catch (e) {
        if ((e as DOMException).name === 'AbortError') return 'cancelled';
        // NotAllowedError 등 → 아래 미리보기로
      }
    }
    return 'preview';
  }
  if (isInAppBrowser()) return 'preview';
  download(blob, filename);
  return 'saved';
}
