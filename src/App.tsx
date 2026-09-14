import { useState, type CSSProperties } from 'react';
import AnimalCharacter from './components/AnimalCharacter';
import { BOOTH } from './config';
import { CHIPS, KW_BG, KW_INK, ORDER, STATS, TYPES } from './data';
import { TestApi, useTest } from './useTest';

const INK = '#2E2A4D';
const S = (s: CSSProperties) => s;

const backBtn: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 12,
  background: 'rgba(255,255,255,.72)',
  fontSize: 17,
  color: INK,
  flex: 'none',
};

export default function App() {
  const t = useTest();
  const { screen } = t.state;

  return (
    <div
      style={S({
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        background: '#EDEAFB',
      })}
    >
      <div
        style={S({
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(168deg,#E8F3FF 0%,#EDE9FE 46%,#F6E9FB 100%)',
          boxShadow: '0 0 0 1px rgba(46,42,77,.05)',
        })}
      >
        {/* aurora blobs — isolated in a clipped, non-scrolling layer so their
            negative offsets don't turn the frame into a scroll trap */}
        <div style={S({ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 })}>
          <div style={blob({ top: -140, left: -110, size: 340, bg: 'radial-gradient(circle,rgba(120,190,255,.55),rgba(120,190,255,0) 70%)', anim: 'aurora 16s ease-in-out infinite', blur: 18 })} />
          <div style={blob({ top: 140, right: -140, size: 330, bg: 'radial-gradient(circle,rgba(186,146,255,.5),rgba(186,146,255,0) 70%)', anim: 'aurora2 19s ease-in-out infinite', blur: 20 })} />
          <div style={blob({ bottom: -120, left: -60, size: 300, bg: 'radial-gradient(circle,rgba(126,231,222,.4),rgba(126,231,222,0) 70%)', anim: 'aurora 22s ease-in-out infinite', blur: 20 })} />
        </div>

        {screen === 'home' && <Home t={t} />}
        {screen === 'quiz' && <Quiz t={t} />}
        {screen === 'loading' && <Loading />}
        {screen === 'result' && <Result t={t} />}
        {screen === 'invite' && <Invite t={t} />}
        {screen === 'signup' && <Signup t={t} />}
        {screen === 'map' && <MapScreen t={t} />}
        {screen === 'compare' && <Compare t={t} />}
        {screen === 'stats' && <Stats t={t} />}

        {t.state.cardPreview && (
          <div
            onClick={t.closeCardPreview}
            style={S({
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: '24px 20px',
              background: 'rgba(24,21,44,.9)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              animation: 'fadeup .25s ease both',
            })}
          >
            <div style={S({ font: "800 14.5px/1.5 'Gothic A1'", color: '#fff', textAlign: 'center' })}>
              이미지를 꾹 눌러서 사진첩에 저장해줘 📷
            </div>
            <img
              src={t.state.cardPreview}
              alt="내 결과 카드"
              onClick={(e) => e.stopPropagation()}
              style={S({ display: 'block', maxWidth: 'min(100%, 340px)', maxHeight: 'calc(100dvh - 150px)', objectFit: 'contain', borderRadius: 18, boxShadow: '0 16px 40px rgba(0,0,0,.35)', WebkitTouchCallout: 'default' })}
            />
            <button onClick={t.closeCardPreview} style={S({ padding: '12px 28px', borderRadius: 999, background: 'rgba(255,255,255,.92)', font: "800 13.5px 'Gothic A1'", color: INK })}>
              닫기
            </button>
          </div>
        )}

        {t.state.toast && (
          <div
            role="status"
            style={S({
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max-content',
              maxWidth: 'calc(100vw - 48px)',
              padding: '16px 24px',
              borderRadius: 999,
              background: INK,
              color: '#F3F0FF',
              font: "700 14.5px/1.4 'Gothic A1'",
              textAlign: 'center',
              boxShadow: '0 10px 24px rgba(46,42,77,.32)',
              animation: 'toastin .25s ease both',
              zIndex: 70,
              pointerEvents: 'none',
            })}
          >
            {t.state.toast}
          </div>
        )}
      </div>
    </div>
  );
}

function blob(o: {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
  bg: string;
  anim: string;
  blur: number;
}): CSSProperties {
  return {
    position: 'absolute',
    top: o.top,
    bottom: o.bottom,
    left: o.left,
    right: o.right,
    width: o.size,
    height: o.size,
    borderRadius: '50%',
    background: o.bg,
    filter: `blur(${o.blur}px)`,
    animation: o.anim,
    pointerEvents: 'none',
  };
}

/* ================= HOME ================= */
function Home({ t }: { t: TestApi }) {
  const { homeChar } = t;
  const { homeIdx } = t.state;
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 22px 26px' })}>
      <div style={S({ paddingTop: 24, display: 'flex', justifyContent: 'center' })}>
        <div style={S({ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px 7px 8px', borderRadius: 999, background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(6px)', boxShadow: '0 2px 10px rgba(76,64,150,.08)' })}>
          <span style={S({ width: 26, height: 26, borderRadius: 9, background: 'repeating-linear-gradient(135deg,rgba(108,92,231,.2) 0 4px,rgba(108,92,231,.06) 4px 8px)', display: 'block' })} />
          <span style={S({ font: "800 12px/1 'Gothic A1'", color: INK })}>{BOOTH.orgName}</span>
          <span style={S({ font: '500 10.5px/1 ui-monospace,Menlo,monospace', color: 'rgba(46,42,77,.42)' })}>로고 자리</span>
        </div>
      </div>

      <div style={S({ paddingTop: 20, textAlign: 'center' })}>
        <div style={S({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: INK, color: '#F3F0FF', font: "700 11.5px/1 'Gothic A1'" })}>
          <span style={S({ width: 6, height: 6, borderRadius: '50%', background: '#7EE7DE', display: 'inline-block' })} />
          {BOOTH.boothDate} 부스 사전 심리테스트
        </div>
        <h1 style={S({ margin: '16px 0 6px', fontFamily: "'Jua',sans-serif", fontSize: 38, lineHeight: 1.2, color: INK })}>
          내 성격이 동물이면<br />어떤 애일까?
        </h1>
        <p style={S({ margin: 0, font: "500 14px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>
           내 성격에 딱 맞는 동물 캐릭터가 뿅!<br />
        </p>
      </div>

      <div style={S({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 0 6px', minHeight: 300 })}>
        <div style={S({ position: 'relative', animation: 'bob 3.6s ease-in-out infinite' })}>
          <div style={S({ transform: 'scale(1.02)', transformOrigin: 'center' })}>
            <AnimalCharacter kind={homeChar.key} />
          </div>
          <span style={S({ position: 'absolute', top: -6, right: -16, fontSize: 19, color: '#8B7BFF', animation: 'twinkle 2.4s ease-in-out infinite' })}>✦</span>
          <span style={S({ position: 'absolute', bottom: 26, left: -26, fontSize: 13, color: '#5AC8E8', animation: 'twinkle 2.4s ease-in-out .9s infinite' })}>✦</span>
        </div>

        <div style={S({ marginTop: 30, textAlign: 'center', minHeight: 66 })}>
          <div style={S({ font: "800 12px/1 'Gothic A1'", color: homeChar.ink })}>{homeChar.species}</div>
          <div style={S({ marginTop: 7, fontFamily: "'Jua',sans-serif", fontSize: 24, color: INK })}>{homeChar.name}</div>
          <div style={S({ marginTop: 4, font: "600 13px/1.5 'Gothic A1'", color: 'rgba(46,42,77,.55)' })}>{homeChar.tagline}</div>
        </div>

        <div style={S({ marginTop: 14, display: 'flex', gap: 7 })}>
          {ORDER.map((k, i) => (
            <span
              key={k}
              style={S({
                width: i === homeIdx ? 20 : 7,
                height: 7,
                borderRadius: 999,
                background: i === homeIdx ? '#6C5CE7' : 'rgba(108,92,231,.24)',
                transition: 'all .3s ease',
              })}
            />
          ))}
        </div>
      </div>

      <div style={S({ display: 'flex', flexDirection: 'column', gap: 11 })}>
        <button
          onClick={t.start}
          style={S({
            width: '100%',
            padding: 19,
            borderRadius: 20,
            background: 'linear-gradient(120deg,#6C5CE7,#8E7BFF 55%,#5AC8E8)',
            color: '#fff',
            fontFamily: "'Jua',sans-serif",
            fontSize: 20,
            boxShadow: '0 8px 20px rgba(108,92,231,.35)',
          })}
        >
          테스트 시작하기
        </button>
      </div>
    </div>
  );
}

/* ================= QUIZ ================= */
function Quiz({ t }: { t: TestApi }) {
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '22px 22px 28px' })}>
      <div style={S({ display: 'flex', alignItems: 'center', gap: 12 })}>
        <button onClick={t.back} style={backBtn}>‹</button>
        <div style={S({ flex: 1, height: 10, borderRadius: 999, background: 'rgba(108,92,231,.14)', overflow: 'hidden' })}>
          <div style={S({ height: '100%', width: t.progressPct, borderRadius: 999, background: 'linear-gradient(90deg,#5AC8E8,#8E7BFF)', transition: 'width .35s cubic-bezier(.4,1.4,.5,1)' })} />
        </div>
        <div style={S({ font: "800 12px/1 'Gothic A1'", color: 'rgba(46,42,77,.55)', flex: 'none' })}>{t.qLabel}</div>
      </div>

      <div style={S({ marginTop: 40 })}>
        <div style={S({ fontFamily: "'Jua',sans-serif", fontSize: 15, color: 'rgba(108,92,231,.75)' })}>Q{t.qNumber}</div>
        <h2 style={S({ margin: '8px 0 0', fontFamily: "'Jua',sans-serif", fontSize: 26, lineHeight: 1.4, color: INK, textWrap: 'pretty' })}>{t.question.text}</h2>
      </div>

      <div style={S({ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 10 })}>
        {t.question.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => t.pick(opt.w)}
            style={S({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '15px 16px',
              borderRadius: 18,
              background: 'rgba(255,255,255,.9)',
              boxShadow: '0 4px 14px rgba(76,64,150,.1)',
              textAlign: 'left',
            })}
          >
            <span style={S({ flex: 'none', width: 29, height: 29, borderRadius: 10, background: CHIPS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 12.5px/1 'Gothic A1'", color: INK })}>
              {['A', 'B', 'C', 'D'][i]}
            </span>
            <span style={S({ font: "600 15px/1.45 'Gothic A1'", color: INK, textWrap: 'pretty' })}>{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================= LOADING ================= */
const LOADING_PHRASES = ['조물조물', '뚝딱뚝딱', '찌릿찌릿', '조몰락조몰락', '꾹꾹'];

function Loading() {
  const [phrase] = useState(
    () => LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)],
  );
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, padding: 24 })}>
      <div style={S({ position: 'relative', width: 152, height: 152, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <div style={S({ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px dashed rgba(108,92,231,.28)', animation: 'spinslow 7s linear infinite' })} />
        <div style={S({ width: 96, height: 88, background: 'linear-gradient(140deg,#A8E6FF,#C3B4F5)', animation: 'blobby 2.2s ease-in-out infinite', boxShadow: 'inset 10px 12px 0 rgba(255,255,255,.55)' })} />
      </div>
      <div style={S({ textAlign: 'center' })}>
        <div style={S({ fontFamily: "'Jua',sans-serif", fontSize: 22, color: INK })}>내 캐릭터 생성하는 중…</div>
        <div style={S({ marginTop: 6, font: "500 13px 'Gothic A1'", color: 'rgba(46,42,77,.55)' })}>{phrase}</div>
      </div>
    </div>
  );
}

/* ================= shared: 부스 정보 리스트 ================= */
function BoothFacts() {
  const activities = [
    '내 캐릭터의 집 만들기',
    '캐릭터에 맞는 슬라임 만들기',
    `다 하면 ${BOOTH.freebie} 증정!`,
  ];
  return (
    <div style={S({ marginTop: 18, paddingTop: 16, borderTop: '2px dashed rgba(108,92,231,.2)', display: 'flex', flexDirection: 'column', gap: 13 })}>
      <Fact label="언제" value={`${BOOTH.boothDate} · ${BOOTH.boothTime}`} />
      <Fact label="어디서" value={BOOTH.boothPlace} />
      <div style={S({ display: 'flex', gap: 14, alignItems: 'flex-start' })}>
        <span style={S({ flex: 'none', width: 46, font: "800 11.5px 'Gothic A1'", color: 'rgba(46,42,77,.45)', paddingTop: 2 })}>뭐하고</span>
        <span style={S({ display: 'flex', flexDirection: 'column', gap: 7 })}>
          {activities.map((a) => (
            <span key={a} style={S({ display: 'flex', alignItems: 'baseline', gap: 8, font: "700 14.5px/1.45 'Gothic A1'", color: INK })}>
              <span style={S({ width: 6, height: 6, borderRadius: '50%', background: '#8E7BFF', display: 'inline-block' })} />
              {a}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={S({ display: 'flex', gap: 14, alignItems: 'baseline' })}>
      <span style={S({ flex: 'none', width: 46, font: "800 11.5px 'Gothic A1'", color: 'rgba(46,42,77,.45)' })}>{label}</span>
      <span style={S({ font: "700 15px/1.5 'Gothic A1'", color: INK })}>{value}</span>
    </div>
  );
}

/* ================= RESULT ================= */
function Result({ t }: { t: TestApi }) {
  const { res } = t;
  const smallBtn: CSSProperties = { flex: 1, padding: 15, borderRadius: 18, background: 'rgba(255,255,255,.9)', font: "800 13.5px 'Gothic A1'", color: INK, boxShadow: '0 5px 14px rgba(76,64,150,.1)' };
  const navCard: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, padding: 16, borderRadius: 20, textAlign: 'left' };

  return (
    <div style={S({ position: 'relative', padding: '26px 20px 36px' })}>
      <div style={S({ textAlign: 'center', animation: 'fadeup .5s ease both' })}>
        <div style={S({ font: "800 12px/1 'Gothic A1'", letterSpacing: '.16em', color: 'rgba(46,42,77,.45)' })}>MY ANIMAL TYPE</div>
        <div style={S({ marginTop: 16, display: 'flex', justifyContent: 'center', animation: 'popin .6s cubic-bezier(.3,1.5,.5,1) both' })}>
          <div style={S({ transform: 'scale(1.02)', transformOrigin: 'center' })}>
            <AnimalCharacter kind={res.key} />
          </div>
        </div>
        <div style={S({ marginTop: 24, font: "800 13px/1.4 'Gothic A1'", color: res.ink })}>{res.species} · {res.tagline}</div>
        <h2 style={S({ margin: '8px 0 0', fontFamily: "'Jua',sans-serif", fontSize: 31, color: INK })}>{res.name}</h2>
        <div style={S({ marginTop: 6, font: "600 14px/1.5 'Gothic A1'", color: 'rgba(46,42,77,.62)' })}>{res.sub}</div>
      </div>

      <div style={S({ marginTop: 20, background: 'rgba(255,255,255,.92)', borderRadius: 24, padding: '22px 20px', boxShadow: '0 8px 24px rgba(76,64,150,.12)', animation: 'fadeup .5s .08s ease both' })}>
        <p style={S({ margin: 0, font: "500 15px/1.75 'Gothic A1'", color: '#3D3860', textWrap: 'pretty' })}>{res.desc}</p>
        <div style={S({ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 })}>
          {res.keywords.map((k, i) => (
            <span key={k} style={S({ padding: '8px 13px', borderRadius: 999, background: KW_BG[i], font: "800 12.5px/1 'Gothic A1'", color: KW_INK[i] })}>{k}</span>
          ))}
        </div>
      </div>

      {/* TODO 시안 비교용 — 하나 고르면 다른 하나와 시안 라벨 삭제 */}
      <DraftLabel>시안 1 · 설명 문구</DraftLabel>
      <BestMatchText t={t} />
      <DraftLabel>시안 3 · 하트로 잇기</DraftLabel>
      <BestMatchPair t={t} />

      
      <div style={S({ marginTop: 12, display: 'flex', gap: 10 })}>
        <button onClick={t.share} style={smallBtn}>결과 공유</button>
        <button onClick={t.saveImage} style={smallBtn}>이미지 저장</button>
      </div>

      <div style={S({ marginTop: 12, display: 'flex', gap: 10 })}>
        <button onClick={t.restart} style={{ ...smallBtn, flex: '1', padding: '15px 16px' }}>다시 검사하기</button>
      </div>

      <div style={S({ marginTop: 30, display: 'flex', alignItems: 'center', gap: 10 })}>
        <span style={S({ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg,rgba(108,92,231,.3) 0 6px,transparent 6px 12px)' })} />
        <span style={S({ font: "800 11px/1 'Gothic A1'", letterSpacing: '.14em', color: 'rgba(46,42,77,.45)' })}>INVITATION</span>
        <span style={S({ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg,rgba(108,92,231,.3) 0 6px,transparent 6px 12px)' })} />
      </div>

      <div style={S({ marginTop: 16, background: '#fff', borderRadius: 26, padding: '24px 20px', boxShadow: '0 10px 30px rgba(76,64,150,.16)', border: '2px solid rgba(108,92,231,.1)' })}>
        <div style={S({ display: 'flex', alignItems: 'center', gap: 9 })}>
          <span style={S({ width: 26, height: 26, borderRadius: 9, background: 'repeating-linear-gradient(135deg,rgba(108,92,231,.2) 0 4px,rgba(108,92,231,.06) 4px 8px)', display: 'block' })} />
          <span style={S({ font: "800 12px/1 'Gothic A1'", color: INK })}>{BOOTH.orgName}</span>
        </div>
        <div style={S({ marginTop: 14, fontFamily: "'Jua',sans-serif", fontSize: 25, lineHeight: 1.34, color: INK })}>
          {res.name},<br />{BOOTH.boothDate}에 만들러 올래?
        </div>
        <div style={S({ marginTop: 8, font: "600 13.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>{BOOTH.boothName} · 내 결과로 만드는 하루</div>

        <BoothFacts />

        <div style={S({ marginTop: 18, padding: 14, borderRadius: 18, background: res.tint, display: 'flex', alignItems: 'center', gap: 12 })}>
          <AnimalCharacter kind={res.key} scale={0.27} />
          <span style={S({ font: "700 13px/1.6 'Gothic A1'", color: INK, textWrap: 'pretty' })}>
            너는 「{res.recipe}」 담당! 부스에서 이 레시피 그대로 만들 수 있어.
          </span>
        </div>

      </div>

      <div style={S({ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
        <button onClick={t.goSignup} style={{ ...navCard, background: 'linear-gradient(125deg,#6C5CE7,#8E7BFF)', color: '#fff', boxShadow: '0 8px 20px rgba(108,92,231,.3)' }}>
          <span style={S({ fontFamily: "'Jua',sans-serif", fontSize: 16 })}>사전 신청</span>
          <span style={S({ font: "500 11px 'Gothic A1'", opacity: 0.8 })}>줄 안 서고 바로 입장</span>
        </button>
        <NavCard title="부스 위치" sub="가는 길 보기" onClick={t.goMap} />
        <NavCard title="친구랑 비교" sub="우리 궁합은?" onClick={t.goCompare} />
        <NavCard title="유형 통계" sub="몇 명이 나랑 같을까" onClick={t.goStats} />
      </div>
    </div>
  );
}

/* ================= 환상의 짝꿍 시안 ================= */
function DraftLabel({ children }: { children: string }) {
  return (
    <div style={S({ marginTop: 16, font: "800 11px/1 ui-monospace,Menlo,monospace", color: '#E0457B' })}>{children}</div>
  );
}

const bestCard: CSSProperties = { marginTop: 8, background: 'rgba(255,255,255,.92)', borderRadius: 20, boxShadow: '0 6px 18px rgba(76,64,150,.1)', animation: 'fadeup .5s .12s ease both' };
const bestLabel: CSSProperties = { font: "800 11px/1 'Gothic A1'", color: 'rgba(46,42,77,.48)' };
const bestText: CSSProperties = { margin: 0, font: "500 13.5px/1.65 'Gothic A1'", color: '#3D3860', wordBreak: 'keep-all', textWrap: 'pretty' };

// 시안 1: 짝꿍 캐릭터 + 소개 문구
function BestMatchText({ t }: { t: TestApi }) {
  const { res } = t;
  const best = TYPES[res.best];
  return (
    <div style={S({ ...bestCard, padding: '16px 18px 18px 14px' })}>
      <div style={S(bestLabel)}>환상의 짝꿍</div>
      <div style={S({ marginTop: 6, display: 'flex', alignItems: 'center', gap: 14 })}>
        <div style={S({ flex: 'none', width: 84, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' })}>
          <AnimalCharacter kind={res.best} scale={0.3} />
          <div style={S({ marginTop: 6, fontFamily: "'Jua',sans-serif", fontSize: 15, lineHeight: 1.25, color: INK, wordBreak: 'keep-all' })}>{best.name}</div>
        </div>
        <div style={S({ flex: 1, minWidth: 0 })}>
          <div style={S({ font: "800 13px/1.3 'Gothic A1'", color: best.ink })}>이런 점이 잘 맞아!</div>
          <p style={S({ ...bestText, marginTop: 6 })}>{res.bestTalk}</p>
        </div>
      </div>
    </div>
  );
}

// 시안 3: 내 캐릭터 💕 짝꿍 캐릭터 + 소개 문구
function BestMatchPair({ t }: { t: TestApi }) {
  const { res } = t;
  const best = TYPES[res.best];
  const who = (type: typeof res, tag: string) => (
    <div style={S({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' })}>
      <AnimalCharacter kind={type.key} scale={0.38} />
      <div style={S({ marginTop: 6, font: "800 10.5px/1 'Gothic A1'", color: type.ink })}>{tag}</div>
      <div style={S({ marginTop: 5, fontFamily: "'Jua',sans-serif", fontSize: 15, lineHeight: 1.25, color: INK, wordBreak: 'keep-all' })}>{type.name}</div>
    </div>
  );
  return (
    <div style={S({ ...bestCard, padding: '16px 16px 18px' })}>
      <div style={S({ ...bestLabel, textAlign: 'center' })}>환상의 짝꿍</div>
      <div style={S({ marginTop: 8, display: 'flex', alignItems: 'center' })}>
        {who(res, '나')}
        <span style={S({ flex: 'none', fontSize: 24, animation: 'twinkle 2.4s ease-in-out infinite' })}>💕</span>
        {who(best, '짝꿍')}
      </div>
      <p style={S({ ...bestText, marginTop: 14, padding: '13px 15px', borderRadius: 16, background: 'linear-gradient(120deg,#EAF4FF,#F3E9FF)', textAlign: 'center' })}>{res.bestTalk}</p>
    </div>
  );
}

function NavCard({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={S({ display: 'flex', flexDirection: 'column', gap: 4, padding: 16, borderRadius: 20, background: 'rgba(255,255,255,.92)', textAlign: 'left', boxShadow: '0 6px 18px rgba(76,64,150,.1)' })}
    >
      <span style={S({ fontFamily: "'Jua',sans-serif", fontSize: 16, color: INK })}>{title}</span>
      <span style={S({ font: "500 11px 'Gothic A1'", color: 'rgba(46,42,77,.5)' })}>{sub}</span>
    </button>
  );
}

/* ================= 초대장 단독 ================= */
function Invite({ t }: { t: TestApi }) {
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', padding: '22px 20px 30px' })}>
      <button onClick={t.back} style={backBtn}>‹</button>
      <div style={S({ marginTop: 16, background: '#fff', borderRadius: 26, padding: '26px 22px', boxShadow: '0 12px 32px rgba(76,64,150,.16)', border: '2px solid rgba(108,92,231,.1)', animation: 'popin .5s cubic-bezier(.3,1.4,.5,1) both' })}>
        <div style={S({ textAlign: 'center', paddingBottom: 18, borderBottom: '2px dashed rgba(108,92,231,.2)' })}>
          <div style={S({ font: "800 11px/1 'Gothic A1'", letterSpacing: '.18em', color: 'rgba(46,42,77,.45)' })}>YOU'RE INVITED</div>
          <div style={S({ margin: '14px auto 0', width: 44, height: 44, borderRadius: 13, background: 'repeating-linear-gradient(135deg,rgba(108,92,231,.2) 0 5px,rgba(108,92,231,.06) 5px 10px)' })} />
          <div style={S({ marginTop: 12, fontFamily: "'Jua',sans-serif", fontSize: 28, lineHeight: 1.3, color: INK })}>{BOOTH.boothName}</div>
          <div style={S({ marginTop: 8, font: "600 13.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>{BOOTH.orgName}가 여는 하루 부스</div>
        </div>
        <div style={S({ display: 'flex', flexDirection: 'column', gap: 13, paddingTop: 18 })}>
          <Fact label="언제" value={`${BOOTH.boothDate} · ${BOOTH.boothTime}`} />
          <Fact label="어디서" value={BOOTH.boothPlace} />
          <div style={S({ display: 'flex', gap: 14, alignItems: 'flex-start' })}>
            <span style={S({ flex: 'none', width: 46, font: "800 11.5px 'Gothic A1'", color: 'rgba(46,42,77,.45)', paddingTop: 2 })}>뭐하고</span>
            <span style={S({ display: 'flex', flexDirection: 'column', gap: 7 })}>
              {['내 캐릭터의 집 만들기', '캐릭터에 맞는 슬라임 만들기', `다 하면 ${BOOTH.freebie} 증정!`].map((a) => (
                <span key={a} style={S({ display: 'flex', alignItems: 'baseline', gap: 8, font: "700 14.5px/1.45 'Gothic A1'", color: INK })}>
                  <span style={S({ width: 6, height: 6, borderRadius: '50%', background: '#8E7BFF', display: 'inline-block' })} />
                  {a}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div style={S({ marginTop: 20, padding: 15, borderRadius: 18, background: 'linear-gradient(120deg,#EAF4FF,#F0E9FF)', font: "700 13px/1.6 'Gothic A1'", color: INK })}>
          먼저 심리테스트를 하면 내 동물이 정해져. 동물에 따라 만들 수 있는 활동이 달라지니까, 테스트 먼저 하고 부스로 와!
        </div>
      </div>
      <div style={S({ marginTop: 14, display: 'flex', gap: 10 })}>
        <button onClick={t.start} style={S({ flex: 1, padding: 17, borderRadius: 18, background: 'linear-gradient(120deg,#6C5CE7,#5AC8E8)', color: '#fff', fontFamily: "'Jua',sans-serif", fontSize: 17, boxShadow: '0 8px 20px rgba(108,92,231,.3)' })}>테스트 먼저 하기</button>
      </div>
    </div>
  );
}

/* ================= 사전 신청 ================= */
function Signup({ t }: { t: TestApi }) {
  const { res } = t;
  const input: CSSProperties = { padding: '14px 15px', borderRadius: 14, border: '2px solid rgba(108,92,231,.16)', background: '#FAF9FF', font: "600 15px 'Gothic A1'", color: INK, outline: 'none' };
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', padding: '22px 20px 30px' })}>
      <button onClick={t.back} style={backBtn}>‹</button>
      <h2 style={S({ margin: '18px 0 6px', fontFamily: "'Jua',sans-serif", fontSize: 28, color: INK })}>사전 신청하기</h2>
      <p style={S({ margin: '0 0 20px', font: "500 13.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>미리 신청하면 재료가 떨어져도 네 몫은 남겨둘게!</p>

      <div style={S({ background: 'rgba(255,255,255,.94)', borderRadius: 24, padding: 20, boxShadow: '0 8px 24px rgba(76,64,150,.12)', display: 'flex', flexDirection: 'column', gap: 16 })}>
        <label style={S({ display: 'flex', flexDirection: 'column', gap: 8 })}>
          <span style={S({ font: "800 12px 'Gothic A1'", color: 'rgba(46,42,77,.55)' })}>이름</span>
          <input value={t.state.name} onChange={(e) => t.setName(e.target.value)} placeholder="예) 김유니" style={input} />
        </label>
        <label style={S({ display: 'flex', flexDirection: 'column', gap: 8 })}>
          <span style={S({ font: "800 12px 'Gothic A1'", color: 'rgba(46,42,77,.55)' })}>학교 / 학년</span>
          <input value={t.state.school} onChange={(e) => t.setSchool(e.target.value)} placeholder="예) 유니초등학교 5학년" style={input} />
        </label>
        <div style={S({ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 16, background: res.tint })}>
          <AnimalCharacter kind={res.key} scale={0.22} />
          <span style={S({ font: "700 12.5px/1.5 'Gothic A1'", color: INK })}>내 유형 · {t.state.result ? res.name : '아직 테스트 전'}</span>
        </div>
      </div>

      <button onClick={t.submitSignup} style={S({ marginTop: 14, width: '100%', padding: 18, borderRadius: 20, background: 'linear-gradient(120deg,#6C5CE7,#8E7BFF 60%,#5AC8E8)', color: '#fff', fontFamily: "'Jua',sans-serif", fontSize: 18, boxShadow: '0 8px 20px rgba(108,92,231,.3)' })}>신청 완료하기</button>
      <p style={S({ margin: '12px 4px 0', font: "500 11.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.45)' })}>입력한 정보는 이 휴대폰에만 저장돼. 부스에서 이름만 말해주면 돼!</p>
    </div>
  );
}

/* ================= 지도 ================= */
function MapScreen({ t }: { t: TestApi }) {
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', padding: '22px 20px 30px' })}>
      <button onClick={t.back} style={backBtn}>‹</button>
      <h2 style={S({ margin: '18px 0 6px', fontFamily: "'Jua',sans-serif", fontSize: 28, color: INK })}>부스 위치</h2>
      <p style={S({ margin: '0 0 18px', font: "500 13.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>장소가 정해지면 여기에 지도가 들어가!</p>
      <div style={S({ borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 24px rgba(76,64,150,.12)' })}>
        <div style={S({ height: 250, background: 'repeating-linear-gradient(135deg,rgba(108,92,231,.16) 0 8px,rgba(255,255,255,.7) 8px 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
          <span style={S({ font: '600 11px/1.6 ui-monospace,Menlo,monospace', color: 'rgba(46,42,77,.6)', background: 'rgba(255,255,255,.92)', padding: '10px 12px', borderRadius: 10, textAlign: 'center' })}>
            지도 이미지 자리<br />(약도 / 캡처 넣기)
          </span>
        </div>
        <div style={S({ background: '#fff', padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 })}>
          <Fact label="장소" value={BOOTH.boothPlace} />
          <Fact label="시간" value={`${BOOTH.boothDate} ${BOOTH.boothTime}`} />
          <Fact label="문의" value={`${BOOTH.orgName} 운영팀`} />
        </div>
      </div>
    </div>
  );
}

/* ================= 친구 비교 ================= */
function Compare({ t }: { t: TestApi }) {
  const { res, compat } = t;
  const { friend } = t.state;
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', padding: '22px 20px 30px' })}>
      <button onClick={t.back} style={backBtn}>‹</button>
      <h2 style={S({ margin: '18px 0 6px', fontFamily: "'Jua',sans-serif", fontSize: 28, color: INK })}>친구랑 비교하기</h2>
      <p style={S({ margin: '0 0 18px', font: "500 13.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>친구 결과를 골라봐. 같은 조가 되면 재밌을 조합도 알려줄게!</p>

      <div style={S({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 })}>
        {ORDER.map((k) => (
          <button
            key={k}
            onClick={() => t.setFriend(k)}
            style={S({
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 11,
              borderRadius: 18,
              background: friend === k ? '#fff' : 'rgba(255,255,255,.7)',
              boxShadow: '0 5px 14px rgba(76,64,150,.1)',
              textAlign: 'left',
              border: `2px solid ${friend === k ? '#6C5CE7' : 'transparent'}`,
            })}
          >
            <AnimalCharacter kind={k} scale={0.21} />
            <span style={S({ font: "700 12.5px/1.35 'Gothic A1'", color: INK })}>{TYPES[k].name}</span>
          </button>
        ))}
      </div>

      {friend && compat && (
        <div style={S({ marginTop: 18, background: 'rgba(255,255,255,.94)', borderRadius: 24, padding: '22px 20px', boxShadow: '0 8px 24px rgba(76,64,150,.12)', animation: 'fadeup .35s ease both' })}>
          <div style={S({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 })}>
            <AnimalCharacter kind={res.key} scale={0.37} />
            <span style={S({ fontFamily: "'Jua',sans-serif", fontSize: 21, color: '#6C5CE7' })}>{compat.s}</span>
            <AnimalCharacter kind={friend} scale={0.37} />
          </div>
          <div style={S({ marginTop: 14, textAlign: 'center', fontFamily: "'Jua',sans-serif", fontSize: 20, color: INK })}>{compat.t}</div>
          <p style={S({ margin: '10px 0 0', font: "500 14px/1.7 'Gothic A1'", color: '#3D3860', textAlign: 'center', textWrap: 'pretty' })}>{compat.l}</p>
          <div style={S({ marginTop: 16, padding: 14, borderRadius: 16, background: 'linear-gradient(120deg,#EAF4FF,#F3E9FF)', font: "700 12.5px/1.6 'Gothic A1'", color: INK, textAlign: 'center' })}>같이 오면 추천: {compat.g}</div>
        </div>
      )}
    </div>
  );
}

/* ================= 통계 ================= */
function Stats({ t }: { t: TestApi }) {
  return (
    <div style={S({ position: 'relative', minHeight: '100vh', padding: '22px 20px 30px' })}>
      <button onClick={t.back} style={backBtn}>‹</button>
      <h2 style={S({ margin: '18px 0 6px', fontFamily: "'Jua',sans-serif", fontSize: 28, color: INK })}>유형 통계</h2>
      <p style={S({ margin: '0 0 18px', font: "500 13.5px/1.6 'Gothic A1'", color: 'rgba(46,42,77,.6)' })}>
        지금까지 1,284명이 테스트했어 <span style={S({ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, opacity: 0.6 })}>(예시 숫자)</span>
      </p>
      <div style={S({ background: 'rgba(255,255,255,.94)', borderRadius: 24, padding: 20, boxShadow: '0 8px 24px rgba(76,64,150,.12)', display: 'flex', flexDirection: 'column', gap: 16 })}>
        {STATS.map((s) => {
          const type = TYPES[s.k];
          return (
            <div key={s.k} style={S({ display: 'flex', flexDirection: 'column', gap: 7 })}>
              <div style={S({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' })}>
                <span style={S({ font: "700 13.5px 'Gothic A1'", color: INK })}>{type.name}</span>
                <span style={S({ font: "800 13px 'Gothic A1'", color: 'rgba(46,42,77,.5)' })}>{s.p}</span>
              </div>
              <div style={S({ height: 14, borderRadius: 999, background: 'rgba(108,92,231,.1)', overflow: 'hidden' })}>
                <div style={S({ height: '100%', width: s.p, borderRadius: 999, background: type.color, transition: 'width .6s ease' })} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={S({ marginTop: 14, padding: 16, borderRadius: 20, background: 'rgba(255,255,255,.7)', font: "600 12.5px/1.7 'Gothic A1'", color: 'rgba(46,42,77,.65)' })}>
        부스에서는 유형별로 테이블이 나뉘어! 같은 동물끼리 앉아서 만들 수도 있어.
      </div>
    </div>
  );
}
