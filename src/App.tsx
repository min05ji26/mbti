import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import AnimalCharacter from './components/AnimalCharacter';
import { BOOTH } from './config';
import { KW_BG, KW_INK, ORDER, TYPES, type AnimalType } from './data';
import { TestApi, useTest } from './useTest';

/* ================= 디자인 토큰 =================
   컨셉: "뽑는 캐릭터 카드" — 두꺼운 외곽선 + 밀린 그림자(스티커 느낌),
   크림색 도트 배경, 유니콘 그라데이션 포인트 */
const INK = '#1F1B3A';
const CREAM = '#FFF7EC';
const YELLOW = '#FFD66B';
const PINK = '#FF9BD2';
const UNICORN = 'linear-gradient(115deg,#FF9BD2 0%,#C3A6FF 36%,#8FD8FF 68%,#9DF2D6 100%)';
const JUA = "'Jua', sans-serif";
const OPT_COLORS = [YELLOW, '#C3A6FF', PINK, '#8FD8FF'];

const S = (s: CSSProperties) => s;
const pop = (x = 4, color = INK) => `${x}px ${x}px 0 ${color}`;
const sticker = (background: string, extra: CSSProperties = {}): CSSProperties => ({
  background,
  border: `2.5px solid ${INK}`,
  borderRadius: 20,
  boxShadow: pop(),
  color: INK,
  ...extra,
});
const pill = (background: string, extra: CSSProperties = {}): CSSProperties =>
  sticker(background, {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    padding: '7px 13px',
    boxShadow: pop(3),
    font: "800 12.5px/1 'Gothic A1'",
    whiteSpace: 'nowrap',
    ...extra,
  });

export default function App() {
  const t = useTest();
  const { screen } = t.state;

  return (
    <div className="page-bg" style={S({ minHeight: '100vh', display: 'flex', justifyContent: 'center' })}>
      <div className="frame dots" style={S({ width: '100%', maxWidth: 430, minHeight: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: CREAM })}>
        {screen === 'home' && <Home t={t} />}
        {screen === 'quiz' && <Quiz t={t} />}
        {screen === 'loading' && <Loading />}
        {screen === 'result' && <Result t={t} />}
        {screen === 'invite' && <Invite t={t} />}
        {screen === 'map' && <MapScreen t={t} />}
        {screen === 'compare' && <Compare t={t} />}

        {t.state.cardPreview && (
          <div
            onClick={t.closeCardPreview}
            style={S({ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '24px 20px', background: 'rgba(24,21,44,.9)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'fadeup .25s ease both' })}
          >
            <div style={S({ font: "800 14.5px/1.5 'Gothic A1'", color: '#fff', textAlign: 'center' })}>이미지를 꾹 눌러서 사진첩에 저장해줘 📷</div>
            <img
              src={t.state.cardPreview}
              alt="내 결과 카드"
              onClick={(e) => e.stopPropagation()}
              style={S({ display: 'block', maxWidth: 'min(100%, 340px)', maxHeight: 'calc(100dvh - 150px)', objectFit: 'contain', borderRadius: 18, border: `2.5px solid ${CREAM}`, WebkitTouchCallout: 'default' })}
            />
            <button className="press" onClick={t.closeCardPreview} style={pill(CREAM, { padding: '12px 28px', fontSize: 14 })}>닫기</button>
          </div>
        )}

        {t.state.toast && (
          <div
            role="status"
            style={S({ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'max-content', maxWidth: 'calc(100vw - 48px)', padding: '16px 24px', borderRadius: 999, background: INK, color: CREAM, border: `2.5px solid ${INK}`, boxShadow: pop(5, PINK), font: "800 14.5px/1.4 'Gothic A1'", textAlign: 'center', animation: 'toastin .25s ease both', zIndex: 70, pointerEvents: 'none' })}
          >
            {t.state.toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= 공통 조각 ================= */
function Sparkle({ style, delay = 0, size = 18, color = INK }: { style: CSSProperties; delay?: number; size?: number; color?: string }) {
  return (
    <span aria-hidden style={S({ position: 'absolute', fontSize: size, color, animation: `twinkle 2.4s ease-in-out ${delay}s infinite`, pointerEvents: 'none', ...style })}>✦</span>
  );
}

function SubPage({ t, title, desc, children }: { t: TestApi; title: string; desc: string; children: ReactNode }) {
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', padding: '20px 20px 34px' })}>
      <button className="press" onClick={t.back} aria-label="뒤로" style={sticker('#fff', { width: 42, height: 42, borderRadius: 14, boxShadow: pop(3), fontSize: 22, lineHeight: 1 })}>‹</button>
      <h2 style={S({ margin: '20px 0 6px', fontFamily: JUA, fontSize: 31, color: INK })}>{title}</h2>
      <p style={S({ margin: '0 0 22px', font: "600 14px/1.6 'Gothic A1'", color: 'rgba(31,27,58,.62)' })}>{desc}</p>
      {children}
    </div>
  );
}

function Panel({ label, labelBg = YELLOW, children, style }: { label: string; labelBg?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={S(sticker('#fff', { position: 'relative', marginTop: 30, borderRadius: 24, padding: '28px 18px 18px', ...style }))}>
      <span style={S(pill(labelBg, { position: 'absolute', top: -16, left: 16, boxShadow: pop(2), transform: 'rotate(-3deg)' }))}>{label}</span>
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={S({ display: 'flex', gap: 12, alignItems: 'baseline' })}>
      <span style={S({ flex: 'none', width: 50, font: "800 12px 'Gothic A1'", color: 'rgba(31,27,58,.5)' })}>{label}</span>
      <span style={S({ font: "700 15px/1.5 'Gothic A1'", color: INK })}>{value}</span>
    </div>
  );
}

const ACTIVITIES = ['내 캐릭터의 집 만들기', '캐릭터에 맞는 슬라임 만들기', `다 하면 ${BOOTH.freebie} 증정!`];

function BoothFacts() {
  return (
    <div style={S({ display: 'flex', flexDirection: 'column', gap: 12 })}>
      <Fact label="언제" value={`${BOOTH.boothDate} · ${BOOTH.boothTime}`} />
      <Fact label="어디서" value={BOOTH.boothPlace} />
      <Fact
        label="뭐하고"
        value={
          <span style={S({ display: 'flex', flexDirection: 'column', gap: 6 })}>
            {ACTIVITIES.map((a, i) => (
              <span key={a} style={S({ display: 'flex', alignItems: 'center', gap: 8 })}>
                <span style={S({ flex: 'none', width: 10, height: 10, borderRadius: 3, border: `2px solid ${INK}`, background: OPT_COLORS[i], transform: 'rotate(45deg)' })} />
                {a}
              </span>
            ))}
          </span>
        }
      />
    </div>
  );
}

// 티켓 모양 카드 — 가운데 점선 양 끝에 반원 홈
function Ticket({ top, bottom, style }: { top: ReactNode; bottom: ReactNode; style?: CSSProperties }) {
  const notch = (side: 'left' | 'right'): CSSProperties => ({ position: 'absolute', top: -15, [side]: -16, width: 28, height: 28, borderRadius: '50%', background: CREAM, border: `2.5px solid ${INK}` });
  return (
    <div style={S(sticker('#fff', { borderRadius: 26, boxShadow: pop(6), ...style }))}>
      <div style={S({ padding: '22px 20px 20px' })}>{top}</div>
      <div style={S({ position: 'relative', borderTop: `2.5px dashed ${INK}`, margin: '0 14px' })}>
        <span style={S(notch('left'))} />
        <span style={S(notch('right'))} />
      </div>
      <div style={S({ padding: '20px 20px 22px' })}>{bottom}</div>
    </div>
  );
}

/* ================= HOME ================= */
function Home({ t }: { t: TestApi }) {
  const { homeIdx } = t.state;
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '22px 20px 24px' })}>
      <div>
        <span style={S(pill('#fff'))}>🦄 {BOOTH.boothDate} {BOOTH.orgName} 부스 사전 테스트</span>
      </div>

      <h1 style={S({ margin: '30px 0 0', fontFamily: JUA, fontSize: 42, lineHeight: 1.16, color: INK, animation: 'fadeup .5s ease both' })}>
        내 성격이{' '}
        <span style={S({ position: 'relative', display: 'inline-block' })}>
          <span aria-hidden style={S({ position: 'absolute', left: -5, right: -5, bottom: 3, height: 17, borderRadius: 6, background: UNICORN })} />
          <span style={S({ position: 'relative' })}>동물</span>
        </span>
        이면
        <br />
        어떤 애일까?
      </h1>
      <p style={S({ margin: '12px 0 0', font: "600 15px/1.6 'Gothic A1'", color: 'rgba(31,27,58,.66)' })}>내 성격에 딱 맞는 동물 캐릭터가 뿅!</p>

      {/* 남는 세로 공간은 카드 영역이 가져가서 가운데 정렬.
          위쪽 여백은 카드가 위아래로 움직여도 설명 글자와 겹치지 않게 넉넉히 둠 */}
      <div style={S({ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '44px 0 26px' })}>
        <CardFan activeIdx={homeIdx} />
      </div>

      <div style={S({ display: 'flex', flexDirection: 'column', gap: 12 })}>
        <button className="press" onClick={t.start} style={S(sticker(INK, { width: '100%', padding: 19, borderRadius: 20, color: '#fff', fontFamily: JUA, fontSize: 22, boxShadow: pop(5, PINK) }))}>
          내 캐릭터 카드 뽑기 →
        </button>
        <button className="press" onClick={t.goInvite} style={S(sticker('#fff', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '13px 16px', borderRadius: 18, boxShadow: pop(3), textAlign: 'left' }))}>
          <span style={S({ display: 'flex', flexDirection: 'column', gap: 3 })}>
            <span style={S({ font: "800 13.5px/1.3 'Gothic A1'" })}>📍 {BOOTH.boothPlace} · {BOOTH.boothTime}</span>
            <span style={S({ font: "600 11.5px/1.3 'Gothic A1'", color: 'rgba(31,27,58,.55)' })}>부스 초대장 보기</span>
          </span>
          <span style={S({ fontFamily: JUA, fontSize: 20 })}>›</span>
        </button>
      </div>
    </div>
  );
}

// 캐릭터 카드 4장을 부채꼴로 펼치고, 자동으로 한 장씩 앞으로 돌아옴
function CardFan({ activeIdx }: { activeIdx: number }) {
  const place = (pos: number): CSSProperties =>
    [
      { transform: 'translate(-50%, 0) rotate(0deg) scale(1)', zIndex: 4 },
      { transform: 'translate(calc(-50% + 84px), 22px) rotate(13deg) scale(.86)', zIndex: 3 },
      { transform: 'translate(-50%, 36px) rotate(0deg) scale(.74)', zIndex: 1 },
      { transform: 'translate(calc(-50% - 84px), 22px) rotate(-13deg) scale(.86)', zIndex: 2 },
    ][pos];
  return (
    <div style={S({ position: 'relative', flex: 'none', height: 268 })}>
      <Sparkle style={{ top: 6, left: 18 }} size={20} color="#B69CFF" />
      <Sparkle style={{ top: 40, right: 14 }} delay={0.8} size={15} color={PINK} />
      <Sparkle style={{ bottom: 18, left: 34 }} delay={1.5} size={13} color="#5BC6F0" />
      <div style={S({ position: 'absolute', inset: 0, animation: 'bob 3.6s ease-in-out infinite' })}>
        {ORDER.map((k, i) => {
          const type = TYPES[k];
          const pos = (i - activeIdx + ORDER.length) % ORDER.length;
          return (
            <div
              key={k}
              style={S(sticker(type.color, {
                position: 'absolute',
                left: '50%',
                top: 0,
                width: 158,
                height: 222,
                borderRadius: 22,
                padding: 9,
                boxShadow: pop(5),
                transition: 'transform .7s cubic-bezier(.3,1.35,.5,1)',
                display: 'flex',
                flexDirection: 'column',
                ...place(pos),
              }))}
            >
              <span style={S({ font: "800 10.5px/1 'Gothic A1'", color: INK, opacity: 0.7 })}>No.0{i + 1}</span>
              <div style={S({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
                <AnimalCharacter kind={k} scale={0.6} />
              </div>
              <div style={S({ background: '#fff', border: `2px solid ${INK}`, borderRadius: 11, padding: '6px 4px', textAlign: 'center', fontFamily: JUA, fontSize: 14, color: INK, whiteSpace: 'nowrap' })}>{type.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= QUIZ ================= */
function Quiz({ t }: { t: TestApi }) {
  const { qi } = t.state;
  const total = Number(t.qLabel.split(' / ')[1]);
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '20px 20px 26px' })}>
      <div style={S({ display: 'flex', alignItems: 'center', gap: 12 })}>
        <button className="press" onClick={t.back} aria-label="뒤로" style={sticker('#fff', { flex: 'none', width: 42, height: 42, borderRadius: 14, boxShadow: pop(3), fontSize: 22, lineHeight: 1 })}>‹</button>
        <div style={S({ flex: 1, display: 'flex', gap: 5 })}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} style={S({ flex: 1, height: 12, borderRadius: 999, border: `2px solid ${INK}`, background: i < qi ? INK : i === qi ? UNICORN : '#fff', transition: 'background .3s ease' })} />
          ))}
        </div>
        <span style={S({ flex: 'none', fontFamily: JUA, fontSize: 16, color: INK })}>{t.qLabel}</span>
      </div>

      <div key={qi} style={S({ marginTop: 44, animation: 'cardin .5s cubic-bezier(.3,1.35,.5,1) both' })}>
        <div style={S(sticker('#fff', { position: 'relative', padding: '38px 22px 28px', borderRadius: 26, boxShadow: pop(6), transform: 'rotate(-1.2deg)' }))}>
          <span style={S(sticker(UNICORN, { position: 'absolute', top: -20, left: 18, padding: '6px 16px', borderRadius: 14, boxShadow: pop(3), fontFamily: JUA, fontSize: 21, transform: 'rotate(-5deg)' }))}>Q{t.qNumber}</span>
          <h2 style={S({ margin: 0, fontFamily: JUA, fontSize: 25, lineHeight: 1.45, color: INK, wordBreak: 'keep-all', textWrap: 'pretty' })}>{t.question.text}</h2>
        </div>
      </div>

      <div style={S({ marginTop: 'auto', paddingTop: 30, display: 'flex', flexDirection: 'column', gap: 12 })}>
        {t.question.opts.map((opt, i) => (
          <button
            key={`${qi}-${i}`}
            className="press"
            onClick={() => t.pick(opt.w)}
            style={S(sticker('#fff', { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 14px', borderRadius: 18, textAlign: 'left', animation: `fadeup .35s ${0.12 + i * 0.07}s ease backwards` }))}
          >
            <span style={S({ flex: 'none', width: 32, height: 32, borderRadius: 11, border: `2px solid ${INK}`, background: OPT_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: JUA, fontSize: 16 })}>
              {'ABCD'[i]}
            </span>
            <span style={S({ font: "700 15px/1.45 'Gothic A1'", wordBreak: 'keep-all', textWrap: 'pretty' })}>{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= LOADING ================= */
const LOADING_PHRASES = ['두근두근', '카드 섞는 중', '반짝반짝', '거의 다 됐어', '뿅 나오기 직전'];

function Loading() {
  const [phrase] = useState(() => LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, padding: 24 })}>
      <div style={S({ position: 'relative', width: 172, height: 236 })}>
        <Sparkle style={{ top: -18, left: -26 }} size={24} color="#B69CFF" />
        <Sparkle style={{ top: 30, right: -34 }} delay={0.6} size={18} color={PINK} />
        <Sparkle style={{ bottom: -10, left: -30 }} delay={1.2} size={16} color="#5BC6F0" />
        <div style={S(sticker(UNICORN, { position: 'absolute', inset: 0, borderRadius: 24, boxShadow: pop(7), animation: 'shake 1s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }))}>
          <div style={S({ position: 'absolute', inset: 10, borderRadius: 16, border: '2.5px dashed rgba(255,255,255,.9)' })} />
          <span style={S({ fontFamily: JUA, fontSize: 92, color: '#fff', textShadow: `4px 4px 0 ${INK}`, WebkitTextStroke: `2px ${INK}` })}>?</span>
        </div>
      </div>
      <div style={S({ textAlign: 'center' })}>
        <div style={S({ fontFamily: JUA, fontSize: 24, color: INK })}>내 캐릭터 생성하는 중…</div>
        <div style={S({ marginTop: 12, ...pill('#fff') })}>{phrase}</div>
      </div>
    </div>
  );
}

/* ================= RESULT ================= */
type LetterStage = 'hidden' | 'envelope' | 'opening' | 'open';

function Result({ t }: { t: TestApi }) {
  const { res } = t;
  const { inviteSeen } = t.state;
  const [stage, setStage] = useState<LetterStage>('hidden');

  // 초대장 편지 자동 등장: 결과 보고 3.5초 뒤 또는 처음 스크롤할 때 (결과당 한 번만)
  useEffect(() => {
    if (inviteSeen) return;
    let armed = false;
    const fire = () => {
      t.seeInvite();
      setStage('envelope');
    };
    const timer = window.setTimeout(fire, 3500);
    // 카드 뒤집히는 연출은 방해하지 않도록 잠깐 뒤부터 스크롤 감지
    const armTimer = window.setTimeout(() => (armed = true), 1200);
    const onScroll = () => {
      if (armed && window.scrollY > 60) fire();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(armTimer);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteSeen]);

  return (
    <div style={S({ position: 'relative', padding: '22px 20px 104px' })}>
      <div style={S({ textAlign: 'center', animation: 'fadeup .4s ease both' })}>
        <span style={S(pill('#fff', { transform: 'rotate(-2deg)' }))}>🎉 짠! 내 캐릭터 카드</span>
      </div>

      <CharacterCard type={res} no={ORDER.indexOf(res.key) + 1} />

      {/* 1) 방금 뽑은 카드 챙기기 — 카드 바로 아래 */}
      <div style={S({ marginTop: 20, display: 'flex', gap: 10 })}>
        <button className="press" onClick={t.saveImage} style={S(sticker(INK, { flex: 1.25, padding: '16px 10px', borderRadius: 18, color: '#fff', fontFamily: JUA, fontSize: 18, boxShadow: pop(4, PINK) }))}>💾 카드 저장</button>
        <button className="press" onClick={t.share} style={S(sticker(UNICORN, { flex: 1, padding: '16px 10px', borderRadius: 18, fontFamily: JUA, fontSize: 18 }))}>📤 공유</button>
      </div>

      {/* 2) 결과 읽을거리 */}
      <Panel label="🗯️ 나는 이런 애야">
        <p style={S({ margin: 0, font: "500 15px/1.75 'Gothic A1'", color: INK, wordBreak: 'keep-all', textWrap: 'pretty' })}>{res.desc}</p>
      </Panel>

      <BestMatch t={t} />

      {/* 3) 더 둘러보기 */}
      <div style={S({ marginTop: 38, display: 'flex', alignItems: 'center', gap: 10 })}>
        <span style={S({ flex: 1, borderTop: `2.5px dashed ${INK}`, opacity: 0.3 })} />
        <span style={S({ fontFamily: JUA, fontSize: 16, color: INK })}>더 둘러보기</span>
        <span style={S({ flex: 1, borderTop: `2.5px dashed ${INK}`, opacity: 0.3 })} />
      </div>
      <div style={S({ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 })}>
        <NavTile emoji="📍" title="부스 위치" sub="가는 길 보기" bg={YELLOW} onClick={t.goMap} />
        <NavTile emoji="💞" title="친구랑 비교" sub="우리 궁합은?" bg={PINK} onClick={t.goCompare} />
      </div>

      {/* 4) 맨 끝: 다시 하기는 눈에 덜 띄게 */}
      <div style={S({ marginTop: 30, textAlign: 'center' })}>
        <button onClick={t.restart} style={S({ padding: '10px 14px', font: "800 14px 'Gothic A1'", color: 'rgba(31,27,58,.6)', textDecoration: 'underline', textUnderlineOffset: 4 })}>🔄 테스트 다시 하기</button>
      </div>

      {inviteSeen && stage === 'hidden' && (
        <button className="press" onClick={() => setStage('envelope')} aria-label="초대장 다시 보기" style={S(sticker(PINK, { position: 'fixed', zIndex: 40, right: 'max(16px, calc(50vw - 215px + 16px))', bottom: 'calc(20px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px 10px 11px', borderRadius: 999, font: "800 13px/1 'Gothic A1'", animation: 'popin .45s cubic-bezier(.3,1.5,.5,1) both' }))}>
          <span style={S({ fontSize: 22, lineHeight: 1, display: 'inline-block', animation: 'nudge 3.2s ease-in-out infinite' })}>💌</span>
          초대장
        </button>
      )}

      {stage !== 'hidden' && <InviteLetter t={t} stage={stage} setStage={setStage} />}
    </div>
  );
}

/* ================= 초대장 편지 (결과 화면 팝업) ================= */
function InviteLetter({ t, stage, setStage }: { t: TestApi; stage: LetterStage; setStage: (s: LetterStage) => void }) {
  const { res } = t;
  const close = () => setStage('hidden');

  useEffect(() => {
    // 팝업 떠 있는 동안 뒤 페이지 스크롤 막기 + ESC로 닫기
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setStage('hidden');
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [setStage]);

  useEffect(() => {
    if (stage !== 'opening') return;
    const id = window.setTimeout(() => setStage('open'), 420);
    return () => window.clearTimeout(id);
  }, [stage, setStage]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="부스 초대장"
      onClick={close}
      style={S({ position: 'fixed', inset: 0, zIndex: 55, overflowY: 'auto', background: 'rgba(31,27,58,.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'backdropin .3s ease both' })}
    >
      <div style={S({ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px' })}>
        {stage !== 'open' ? (
          <div style={S({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, animation: stage === 'opening' ? 'envpop .42s ease-in both' : 'letterin .7s cubic-bezier(.3,1.4,.5,1) both' })}>
            <span style={S(pill(YELLOW, { padding: '10px 18px', fontFamily: JUA, fontSize: 19, fontWeight: 400, boxShadow: pop(4), transform: 'rotate(-3deg)' }))}>💌 초대장이 도착했어!</span>
            <button
              className="press"
              onClick={(e) => {
                e.stopPropagation();
                setStage('opening');
              }}
              aria-label="초대장 열기"
              style={S({ padding: 0, borderRadius: 18, animation: stage === 'envelope' ? 'wobble 1.5s ease-in-out .7s infinite' : undefined })}
            >
              <Envelope />
            </button>
            <span style={S({ font: "800 14px/1.4 'Gothic A1'", color: '#fff', textShadow: `0 2px 0 ${INK}` })}>편지를 눌러서 열어봐 👆</span>
            <button onClick={close} style={S({ marginTop: -8, padding: '8px 12px', font: "700 12.5px 'Gothic A1'", color: 'rgba(255,255,255,.85)', textDecoration: 'underline', textUnderlineOffset: 3 })}>
              나중에 볼래
            </button>
          </div>
        ) : (
          <div onClick={(e) => e.stopPropagation()} style={S({ position: 'relative', width: '100%', maxWidth: 390, animation: 'ticketup .6s cubic-bezier(.3,1.3,.5,1) both' })}>
            <button className="press" onClick={close} aria-label="닫기" style={sticker('#fff', { position: 'absolute', zIndex: 2, top: -14, right: -6, width: 40, height: 40, borderRadius: '50%', boxShadow: pop(3), fontSize: 18, lineHeight: 1 })}>✕</button>
            <Ticket
              top={
                <>
                  <span style={S(pill(UNICORN, { boxShadow: pop(2) }))}>🎟️ 부스 초대권</span>
                  <div style={S({ marginTop: 14, fontFamily: JUA, fontSize: 25, lineHeight: 1.34, color: INK })}>
                    {res.name},<br />
                    {BOOTH.boothDate}에 만들러 올래?
                  </div>
                  <div style={S({ marginTop: 6, font: "600 13.5px/1.6 'Gothic A1'", color: 'rgba(31,27,58,.6)' })}>🦄 {BOOTH.orgName} · {BOOTH.boothName} · 내 결과로 만드는 하루</div>
                </>
              }
              bottom={
                <>
                  <BoothFacts />
                  <div style={S({ marginTop: 18, padding: '12px 14px', borderRadius: 16, border: `2px solid ${INK}`, background: res.tint, display: 'flex', alignItems: 'center', gap: 12 })}>
                    <AnimalCharacter kind={res.key} scale={0.27} />
                    <span style={S({ font: "700 13px/1.6 'Gothic A1'", color: INK, wordBreak: 'keep-all', textWrap: 'pretty' })}>
                      너는 「{res.recipe}」 담당! 부스에서 이 레시피 그대로 만들 수 있어.
                    </span>
                  </div>
                  <button className="press" onClick={t.goMap} style={S(sticker(INK, { marginTop: 16, width: '100%', padding: 15, borderRadius: 16, color: '#fff', fontFamily: JUA, fontSize: 17, boxShadow: pop(4, PINK) }))}>
                    📍 부스 위치 보러 가기
                  </button>
                </>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 스티커 스타일 편지 봉투 (위로 초대장 종이가 살짝 삐져나옴)
function Envelope() {
  return (
    <svg width="248" height="190" viewBox="-4 -30 248 190" aria-hidden style={S({ display: 'block', overflow: 'visible' })}>
      <rect x="34" y="-22" width="172" height="90" rx="10" fill="#fff" stroke={INK} strokeWidth="3" />
      <text x="120" y="6" textAnchor="middle" fontFamily="'Gothic A1', sans-serif" fontWeight="800" fontSize="11" letterSpacing="2" fill={INK} opacity=".55">INVITATION</text>
      <rect x="10" y="12" width="224" height="140" rx="18" fill={INK} />
      <rect x="4" y="6" width="224" height="140" rx="18" fill="#FFC6E4" stroke={INK} strokeWidth="3" />
      <path d="M10 140 L98 84 M222 140 L134 84" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M4 24 Q4 6 22 6 L210 6 Q228 6 228 24 L130 96 Q116 106 102 96 Z" fill={PINK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="116" cy="94" r="21" fill={YELLOW} stroke={INK} strokeWidth="3" />
      <path d="M116 104 C104 96 102 88 108 84 C112 81 116 84 116 88 C116 84 120 81 124 84 C130 88 128 96 116 104 Z" fill="#E0457B" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// 결과 캐릭터 카드 — 뒤집히며 등장 + 반짝이는 홀로그램 줄
function CharacterCard({ type, no }: { type: AnimalType; no: number }) {
  return (
    <div style={S({ marginTop: 18, perspective: 1100 })}>
      <div style={S(sticker(type.color, { position: 'relative', overflow: 'hidden', borderRadius: 30, padding: 14, boxShadow: pop(7), animation: 'flipin .9s cubic-bezier(.3,1.25,.5,1) both' }))}>
        <div style={S({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 })}>
          <span style={S(pill('#fff', { boxShadow: 'none', padding: '6px 11px', fontSize: 12 }))}>No.0{no}</span>
          <span style={S(pill(INK, { boxShadow: 'none', padding: '6px 11px', fontSize: 12, color: CREAM }))}>{type.species}</span>
        </div>

        <div style={S({ position: 'relative', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
          <span style={S({ position: 'absolute', width: 214, height: 214, borderRadius: '50%', background: 'rgba(255,255,255,.5)', border: '2.5px dashed rgba(31,27,58,.35)', animation: 'spinslow 24s linear infinite' })} />
          <Sparkle style={{ top: 22, right: 34 }} size={20} color="#fff" />
          <Sparkle style={{ bottom: 36, left: 30 }} delay={1} size={15} color="#fff" />
          <div style={S({ position: 'relative', animation: 'bob 3.6s ease-in-out infinite' })}>
            <AnimalCharacter kind={type.key} scale={0.92} />
          </div>
        </div>

        <div style={S({ background: '#fff', border: `2.5px solid ${INK}`, borderRadius: 20, padding: '14px 14px 16px', textAlign: 'center' })}>
          <div style={S({ font: "800 13px/1.4 'Gothic A1'", color: type.ink })}>{type.tagline}</div>
          <h2 style={S({ margin: '4px 0 0', fontFamily: JUA, fontSize: 33, lineHeight: 1.2, color: INK })}>{type.name}</h2>
          <div style={S({ marginTop: 4, font: "600 14px/1.5 'Gothic A1'", color: 'rgba(31,27,58,.62)' })}>{type.sub}</div>
          <div style={S({ marginTop: 12, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 })}>
            {type.keywords.map((k, i) => (
              <span key={k} style={S({ padding: '6px 11px', borderRadius: 999, border: `2px solid ${INK}`, background: KW_BG[i % KW_BG.length], font: "800 12.5px/1 'Gothic A1'", color: KW_INK[i % KW_INK.length] })}>#{k}</span>
            ))}
          </div>
        </div>

        <span aria-hidden className="holo" />
      </div>
    </div>
  );
}

/* ================= 환상의 짝꿍 ================= */
function BestMatch({ t }: { t: TestApi }) {
  const { res } = t;
  const best = TYPES[res.best];
  return (
    <Panel label="💞 환상의 짝꿍" labelBg={PINK}>
      <div style={S({ display: 'flex', alignItems: 'center', gap: 14 })}>
        <div style={S({ flex: 'none', width: 92, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' })}>
          <div style={S({ width: 84, height: 96, borderRadius: 18, border: `2.5px solid ${INK}`, background: best.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-4deg)' })}>
            <AnimalCharacter kind={res.best} scale={0.34} />
          </div>
          <div style={S({ marginTop: 8, fontFamily: JUA, fontSize: 15, lineHeight: 1.25, color: INK, wordBreak: 'keep-all' })}>{best.name}</div>
        </div>
        <div style={S({ flex: 1, minWidth: 0 })}>
          <div style={S({ font: "800 13.5px/1.3 'Gothic A1'", color: best.ink })}>이런 점이 잘 맞아!</div>
          <p style={S({ margin: '6px 0 0', font: "500 14px/1.65 'Gothic A1'", color: INK, wordBreak: 'keep-all', textWrap: 'pretty' })}>{res.bestTalk}</p>
        </div>
      </div>
    </Panel>
  );
}

function NavTile({ emoji, title, sub, bg, onClick }: { emoji: string; title: string; sub: string; bg: string; onClick: () => void }) {
  return (
    <button className="press" onClick={onClick} style={S(sticker(bg, { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '14px 15px 15px', borderRadius: 20, textAlign: 'left' }))}>
      <span style={S({ fontSize: 24, lineHeight: 1 })}>{emoji}</span>
      <span style={S({ marginTop: 4, fontFamily: JUA, fontSize: 18 })}>{title}</span>
      <span style={S({ font: "700 11.5px 'Gothic A1'", opacity: 0.7 })}>{sub}</span>
    </button>
  );
}

/* ================= 초대장 단독 ================= */
function Invite({ t }: { t: TestApi }) {
  return (
    <SubPage t={t} title="부스 초대장" desc={`${BOOTH.orgName}가 여는 하루 부스에 초대할게!`}>
      <div style={S({ animation: 'cardin .5s cubic-bezier(.3,1.35,.5,1) both' })}>
        <Ticket
          top={
            <div style={S({ textAlign: 'center' })}>
              <span style={S(pill(UNICORN, { boxShadow: pop(2) }))}>YOU'RE INVITED</span>
              <div style={S({ marginTop: 16, fontSize: 40, lineHeight: 1 })}>🦄</div>
              <div style={S({ marginTop: 10, fontFamily: JUA, fontSize: 29, lineHeight: 1.3, color: INK })}>{BOOTH.boothName}</div>
              <div style={S({ marginTop: 6, font: "600 13.5px/1.6 'Gothic A1'", color: 'rgba(31,27,58,.6)' })}>{BOOTH.orgName} 체험 부스</div>
            </div>
          }
          bottom={
            <>
              <BoothFacts />
              <div style={S({ marginTop: 18, padding: 14, borderRadius: 16, border: `2px solid ${INK}`, background: '#F1EBFF', font: "700 13px/1.6 'Gothic A1'", color: INK, wordBreak: 'keep-all' })}>
                먼저 심리테스트를 하면 내 동물이 정해져. 동물에 따라 만들 수 있는 활동이 달라지니까, 테스트 먼저 하고 부스로 와!
              </div>
            </>
          }
        />
      </div>
      <button className="press" onClick={t.start} style={S(sticker(INK, { marginTop: 22, width: '100%', padding: 18, borderRadius: 20, color: '#fff', fontFamily: JUA, fontSize: 19, boxShadow: pop(5, PINK) }))}>
        테스트 먼저 하기 →
      </button>
    </SubPage>
  );
}

/* ================= 지도 ================= */
function MapScreen({ t }: { t: TestApi }) {
  return (
    <SubPage t={t} title="부스 위치" desc="장소가 정해지면 여기에 지도가 들어가!">
      <div style={S(sticker('#fff', { overflow: 'hidden', borderRadius: 24, boxShadow: pop(6) }))}>
        <div style={S({ position: 'relative', height: 240, borderBottom: `2.5px solid ${INK}`, background: 'repeating-linear-gradient(135deg, #FFF1C9 0 10px, #FFF7EC 10px 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
          <span style={S({ position: 'absolute', top: 58, fontSize: 38, animation: 'tapfoot 1.2s ease-in-out infinite' })}>📍</span>
          <span style={S(pill('#fff', { marginTop: 70, flexDirection: 'column', gap: 2, borderRadius: 12, font: '700 11px/1.5 ui-monospace,Menlo,monospace', whiteSpace: 'normal', textAlign: 'center' }))}>
            지도 이미지 자리<br />(약도 / 캡처 넣기)
          </span>
        </div>
        <div style={S({ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 })}>
          <Fact label="장소" value={BOOTH.boothPlace} />
          <Fact label="시간" value={`${BOOTH.boothDate} ${BOOTH.boothTime}`} />
          <Fact label="문의" value={`${BOOTH.orgName} 운영팀`} />
        </div>
      </div>
    </SubPage>
  );
}

/* ================= 친구 비교 ================= */
function Compare({ t }: { t: TestApi }) {
  const { res, compat } = t;
  const { friend } = t.state;
  return (
    <SubPage t={t} title="친구랑 비교하기" desc="친구가 뽑은 카드를 골라봐. 같이 오면 재밌을 조합도 알려줄게!">
      <div style={S({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 })}>
        {ORDER.map((k) => {
          const on = friend === k;
          return (
            <button
              key={k}
              className="press"
              onClick={() => t.setFriend(k)}
              aria-pressed={on}
              style={S(sticker(on ? TYPES[k].color : '#fff', { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px 12px', borderRadius: 18, boxShadow: pop(on ? 5 : 3) }))}
            >
              {on && <span style={S(pill(INK, { position: 'absolute', top: -10, right: -8, padding: '4px 8px', fontSize: 11, color: CREAM, boxShadow: 'none' }))}>선택</span>}
              <AnimalCharacter kind={k} scale={0.3} />
              <span style={S({ fontFamily: JUA, fontSize: 14.5, color: INK })}>{TYPES[k].name}</span>
            </button>
          );
        })}
      </div>

      {friend && compat && (
        <div key={friend} style={S(sticker('#fff', { marginTop: 24, borderRadius: 24, padding: '20px 18px', boxShadow: pop(6), animation: 'cardin .45s cubic-bezier(.3,1.35,.5,1) both' }))}>
          <div style={S({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 })}>
            <MiniCard type={res} tag="나" tilt={-6} />
            <span style={S(sticker(UNICORN, { flex: 'none', width: 74, height: 74, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: JUA, fontSize: 22, boxShadow: pop(3) }))}>{compat.s}</span>
            <MiniCard type={TYPES[friend]} tag="친구" tilt={6} />
          </div>
          <div style={S({ marginTop: 16, textAlign: 'center', fontFamily: JUA, fontSize: 22, color: INK })}>{compat.t}</div>
          <p style={S({ margin: '8px 0 0', font: "500 14.5px/1.7 'Gothic A1'", color: INK, textAlign: 'center', wordBreak: 'keep-all', textWrap: 'pretty' })}>{compat.l}</p>
          <div style={S({ marginTop: 16, padding: '12px 14px', borderRadius: 16, border: `2px solid ${INK}`, background: YELLOW, font: "800 13px/1.6 'Gothic A1'", color: INK, textAlign: 'center' })}>👯 같이 오면 추천: {compat.g}</div>
        </div>
      )}
    </SubPage>
  );
}

function MiniCard({ type, tag, tilt }: { type: AnimalType; tag: string; tilt: number }) {
  return (
    <div style={S({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 })}>
      <div style={S({ width: 88, height: 104, borderRadius: 16, border: `2.5px solid ${INK}`, background: type.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${tilt}deg)` })}>
        <AnimalCharacter kind={type.key} scale={0.36} />
      </div>
      <span style={S({ font: "800 11.5px/1 'Gothic A1'", color: 'rgba(31,27,58,.6)' })}>{tag}</span>
    </div>
  );
}
