import type { CSSProperties } from 'react';
import type { AnimalKey } from '../data';

/**
 * CSS-art mascot ported 1:1 from the Claude Design prototype "Animal.dc.html".
 * Intrinsic size is 200 x 250. Pass `scale` to render a clipped thumbnail
 * (matches the `overflow:hidden` + `transform:scale` wrappers used in the design).
 */

interface Palette {
  base: string;
  light: string;
  shade: string;
  deep: string;
  inner: string;
  blush: string;
  armL: string;
  armR: string;
  armAnim: string;
  footAnim: string;
  eyes: 'round' | 'chill' | 'soft' | 'wink';
  mouth: 'open' | 'small' | 'gentle' | 'smirk';
}

const P: Record<AnimalKey, Palette> = {
  dog: {
    base: '#FFC98A', light: '#FFE9C8', shade: '#F0A863', deep: '#B06A2E', inner: '#FFF3E2',
    blush: 'rgba(255,140,150,.42)',
    armL: '-42deg', armR: '42deg', armAnim: 'armup 1s ease-in-out infinite',
    footAnim: 'tapfoot .8s ease-in-out infinite', eyes: 'round', mouth: 'open',
  },
  cat: {
    base: '#C3B4F5', light: '#EAE3FF', shade: '#9D8AE0', deep: '#5C4CA8', inner: '#F3EFFF',
    blush: 'rgba(200,120,240,.34)',
    armL: '8deg', armR: '-8deg', armAnim: 'none', footAnim: 'none', eyes: 'chill', mouth: 'small',
  },
  rabbit: {
    base: '#FFC6DF', light: '#FFE7F2', shade: '#F09EC4', deep: '#B45C86', inner: '#FFF2F8',
    blush: 'rgba(255,120,160,.38)',
    armL: '34deg', armR: '-34deg', armAnim: 'sway 3s ease-in-out infinite', footAnim: 'none',
    eyes: 'soft', mouth: 'gentle',
  },
  fox: {
    base: '#8FD3F0', light: '#D6F1FC', shade: '#5FB2D9', deep: '#2C6E96', inner: '#EAF8FE',
    blush: 'rgba(90,190,235,.42)',
    armL: '12deg', armR: '-64deg', armAnim: 'armup 1.6s ease-in-out infinite', footAnim: 'none',
    eyes: 'wink', mouth: 'smirk',
  },
};

const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });

export default function AnimalCharacter({
  kind,
  scale,
}: {
  kind: AnimalKey;
  scale?: number;
}) {
  const c = P[kind] ?? P.dog;
  const isDog = kind === 'dog';
  const isCat = kind === 'cat';
  const isRabbit = kind === 'rabbit';
  const isFox = kind === 'fox';

  const art = (
    <div style={{ position: 'relative', width: 200, height: 250 }}>
      {/* 그림자 */}
      <div
        style={abs({
          left: '50%', bottom: 0, transform: 'translateX(-50%)',
          width: 132, height: 18, borderRadius: '50%',
          background: 'rgba(46,42,77,.15)', filter: 'blur(6px)',
        })}
      />

      {/* 꼬리 */}
      {isDog && (
        <div
          style={abs({
            right: 32, top: 168, width: 20, height: 60, borderRadius: 999,
            transformOrigin: 'bottom center',
            background: `linear-gradient(180deg,${c.shade},${c.base})`,
            animation: 'wag .7s ease-in-out infinite',
          })}
        />
      )}
      {isCat && (
        <div
          style={abs({
            right: 14, top: 176, width: 64, height: 56,
            border: `14px solid ${c.shade}`, borderRadius: '50%',
            borderRightColor: 'transparent', borderTopColor: 'transparent',
            transform: 'rotate(-16deg)',
          })}
        />
      )}
      {isRabbit && (
        <div
          style={abs({
            right: 36, top: 196, width: 34, height: 34, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%,#fff,${c.light})`,
          })}
        />
      )}
      {isFox && (
        <div
          style={abs({
            right: 6, top: 158, width: 44, height: 76,
            borderRadius: '60% 40% 50% 50%', transform: 'rotate(18deg)',
            transformOrigin: 'bottom left',
            background: `linear-gradient(160deg,${c.base},${c.shade})`,
            animation: 'sway 2.6s ease-in-out infinite',
          })}
        >
          <span
            style={abs({
              left: 6, top: -6, width: 32, height: 30, borderRadius: '50%',
              background: '#F7FCFF', display: 'block',
            })}
          />
        </div>
      )}

      {/* 다리 */}
      <div style={abs({ left: 62, bottom: 8, width: 32, height: 24, borderRadius: '50%', background: c.shade })} />
      <div
        style={abs({
          right: 62, bottom: 8, width: 32, height: 24, borderRadius: '50%',
          background: c.shade, animation: c.footAnim,
        })}
      />

      {/* 몸통 */}
      <div
        style={abs({
          left: 44, top: 150, width: 112, height: 88,
          borderRadius: '48% 48% 42% 42%/56% 56% 44% 44%',
          background: `radial-gradient(circle at 34% 26%,${c.light},${c.base} 60%,${c.shade})`,
          boxShadow:
            'inset -8px -10px 16px rgba(46,42,77,.12),0 8px 18px rgba(46,42,77,.12)',
        })}
      >
        <span
          style={abs({
            left: '50%', top: 26, transform: 'translateX(-50%)',
            width: 64, height: 56, borderRadius: '50%', background: c.inner, opacity: 0.9,
          })}
        />
      </div>

      {/* 팔 */}
      <div
        style={abs({
          left: 30, top: 158, width: 26, height: 52, borderRadius: 999,
          transformOrigin: 'top center',
          background: `linear-gradient(170deg,${c.base},${c.shade})`,
          transform: `rotate(${c.armL})`,
        })}
      />
      <div
        style={abs({
          right: 30, top: 158, width: 26, height: 52, borderRadius: 999,
          transformOrigin: 'top center',
          background: `linear-gradient(190deg,${c.base},${c.shade})`,
          transform: `rotate(${c.armR})`, animation: c.armAnim,
        })}
      />

      {/* 머리 */}
      <div style={abs({ left: 39, top: 52, width: 122, height: 112 })}>
        {isRabbit && (
          <>
            <div
              style={abs({
                left: 20, top: -50, width: 26, height: 70,
                borderRadius: '50% 50% 40% 40%', transform: 'rotate(-10deg)',
                background: `linear-gradient(150deg,${c.light},${c.base} 55%,${c.shade})`,
              })}
            >
              <span style={abs({ left: 6, top: 10, right: 6, bottom: 12, borderRadius: '50%', background: c.inner })} />
            </div>
            <div
              style={abs({
                right: 20, top: -50, width: 26, height: 70,
                borderRadius: '50% 50% 40% 40%', transform: 'rotate(10deg)',
                background: `linear-gradient(210deg,${c.light},${c.base} 55%,${c.shade})`,
              })}
            >
              <span style={abs({ left: 6, top: 10, right: 6, bottom: 12, borderRadius: '50%', background: c.inner })} />
            </div>
          </>
        )}

        {isCat && (
          <>
            <div
              style={abs({
                left: 6, top: -24, width: 44, height: 50, transform: 'rotate(-8deg)',
                clipPath: 'polygon(50% 0,100% 100%,0 100%)',
                background: `linear-gradient(160deg,${c.light},${c.base} 60%,${c.shade})`,
                animation: 'twitch 4.5s ease-in-out infinite',
              })}
            >
              <span
                style={abs({
                  left: 11, top: 18, width: 22, height: 28,
                  clipPath: 'polygon(50% 0,100% 100%,0 100%)', background: c.inner, display: 'block',
                })}
              />
            </div>
            <div
              style={abs({
                right: 6, top: -24, width: 44, height: 50, transform: 'rotate(8deg)',
                clipPath: 'polygon(50% 0,100% 100%,0 100%)',
                background: `linear-gradient(200deg,${c.light},${c.base} 60%,${c.shade})`,
              })}
            >
              <span
                style={abs({
                  left: 11, top: 18, width: 22, height: 28,
                  clipPath: 'polygon(50% 0,100% 100%,0 100%)', background: c.inner, display: 'block',
                })}
              />
            </div>
          </>
        )}

        {isFox && (
          <>
            <div
              style={abs({
                left: -2, top: -34, width: 50, height: 62, transform: 'rotate(-12deg)',
                clipPath: 'polygon(50% 0,100% 100%,0 100%)',
                background: `linear-gradient(160deg,${c.light},${c.base} 45%,${c.shade})`,
              })}
            >
              <span
                style={abs({
                  left: 13, top: 24, width: 24, height: 32,
                  clipPath: 'polygon(50% 0,100% 100%,0 100%)', background: c.deep, display: 'block',
                })}
              />
            </div>
            <div
              style={abs({
                right: -2, top: -34, width: 50, height: 62, transform: 'rotate(12deg)',
                clipPath: 'polygon(50% 0,100% 100%,0 100%)',
                background: `linear-gradient(200deg,${c.light},${c.base} 45%,${c.shade})`,
              })}
            >
              <span
                style={abs({
                  left: 13, top: 24, width: 24, height: 32,
                  clipPath: 'polygon(50% 0,100% 100%,0 100%)', background: c.deep, display: 'block',
                })}
              />
            </div>
          </>
        )}

        {isDog && (
          <>
            <div
              style={abs({
                left: -14, top: 14, width: 38, height: 70,
                borderRadius: '44% 44% 50% 50%', transform: 'rotate(10deg)',
                background: `linear-gradient(150deg,${c.shade},${c.deep})`,
                boxShadow: 'inset -3px -5px 9px rgba(46,42,77,.14)',
              })}
            />
            <div
              style={abs({
                right: -14, top: 14, width: 38, height: 70,
                borderRadius: '44% 44% 50% 50%', transform: 'rotate(-10deg)',
                background: `linear-gradient(210deg,${c.shade},${c.deep})`,
                boxShadow: 'inset 3px -5px 9px rgba(46,42,77,.14)',
              })}
            />
          </>
        )}

        {/* 얼굴 */}
        <div
          style={abs({
            inset: 0, borderRadius: '46% 46% 44% 44%/48% 48% 52% 52%',
            background: `radial-gradient(circle at 32% 24%,${c.light} 0%,${c.base} 46%,${c.shade} 100%)`,
            boxShadow:
              'inset -9px -12px 20px rgba(46,42,77,.14),inset 10px 12px 18px rgba(255,255,255,.5),0 10px 20px rgba(46,42,77,.14)',
          })}
        >
          <span style={abs({ left: 18, top: 13, width: 34, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.5)', filter: 'blur(6px)' })} />
          <span
            style={abs({
              left: '50%', top: '54%', transform: 'translateX(-50%)',
              width: 64, height: 44, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 30%,#fff,${c.inner})`,
            })}
          />

          {/* 눈 */}
          {c.eyes === 'round' && (
            <>
              <span style={abs({ left: 26, top: 44, width: 16, height: 21, borderRadius: '50%', background: '#2E2A4D' })}>
                <span style={abs({ left: 4, top: 4, width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block' })} />
              </span>
              <span style={abs({ right: 26, top: 44, width: 16, height: 21, borderRadius: '50%', background: '#2E2A4D' })}>
                <span style={abs({ left: 4, top: 4, width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block' })} />
              </span>
            </>
          )}
          {c.eyes === 'chill' && (
            <>
              <span style={abs({ left: 26, top: 50, width: 18, height: 9, borderTop: '4px solid #2E2A4D', borderRadius: '50% 50% 0 0' })} />
              <span style={abs({ right: 26, top: 50, width: 18, height: 9, borderTop: '4px solid #2E2A4D', borderRadius: '50% 50% 0 0' })} />
            </>
          )}
          {c.eyes === 'soft' && (
            <>
              <span style={abs({ left: 24, top: 42, width: 19, height: 25, borderRadius: '50%', background: '#2E2A4D' })}>
                <span style={abs({ left: 4, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'block' })} />
                <span style={abs({ right: 4, bottom: 5, width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.8)', display: 'block' })} />
              </span>
              <span style={abs({ right: 24, top: 42, width: 19, height: 25, borderRadius: '50%', background: '#2E2A4D' })}>
                <span style={abs({ left: 4, top: 4, width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'block' })} />
                <span style={abs({ right: 4, bottom: 5, width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,.8)', display: 'block' })} />
              </span>
            </>
          )}
          {c.eyes === 'wink' && (
            <>
              <span style={abs({ left: 26, top: 44, width: 16, height: 21, borderRadius: '50%', background: '#2E2A4D' })}>
                <span style={abs({ left: 4, top: 4, width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block' })} />
              </span>
              <span style={abs({ right: 24, top: 52, width: 20, height: 10, borderBottom: '4px solid #2E2A4D', borderRadius: '0 0 50% 50%' })} />
            </>
          )}

          {/* 코 */}
          <span
            style={abs({
              left: '50%', top: 70, transform: 'translateX(-50%)',
              width: 18, height: 13, borderRadius: '44% 44% 60% 60%', background: c.deep,
            })}
          />

          {/* 입 */}
          {c.mouth === 'open' && (
            <span
              style={abs({
                left: '50%', top: 83, transform: 'translateX(-50%)',
                width: 30, height: 22, borderRadius: '14px 14px 20px 20px',
                background: '#4A2B3D', overflow: 'hidden',
              })}
            >
              <span
                style={abs({
                  left: '50%', bottom: -4, transform: 'translateX(-50%)',
                  width: 22, height: 16, borderRadius: '50%', background: '#FF8FA8', display: 'block',
                })}
              />
            </span>
          )}
          {c.mouth === 'smirk' && (
            <span
              style={abs({
                left: '52%', top: 84, width: 24, height: 11,
                borderBottom: '3.5px solid #2E2A4D', borderRight: '3.5px solid #2E2A4D',
                borderRadius: '0 0 60% 20%',
              })}
            />
          )}
          {c.mouth === 'small' && (
            <span
              style={abs({
                left: '50%', top: 84, transform: 'translateX(-50%)',
                width: 22, height: 10,
                borderBottom: '3.5px solid #2E2A4D', borderLeft: '3.5px solid #2E2A4D',
                borderRight: '3.5px solid #2E2A4D', borderRadius: '0 0 22px 22px',
              })}
            />
          )}
          {c.mouth === 'gentle' && (
            <span
              style={abs({
                left: '50%', top: 85, transform: 'translateX(-50%)',
                width: 26, height: 12,
                borderBottom: '3.5px solid #2E2A4D', borderRadius: '0 0 26px 26px',
              })}
            />
          )}

          <span style={abs({ left: 9, top: 66, width: 24, height: 12, borderRadius: '50%', background: c.blush, filter: 'blur(1px)' })} />
          <span style={abs({ right: 9, top: 66, width: 24, height: 12, borderRadius: '50%', background: c.blush, filter: 'blur(1px)' })} />
        </div>
      </div>

      {/* 성격별 소품 */}
      {isFox && <span style={abs({ right: 6, top: 150, fontSize: 22, animation: 'sway 2.2s ease-in-out infinite' })}>💡</span>}
      {isRabbit && <span style={abs({ left: 16, top: 186, fontSize: 18, animation: 'sway 3s ease-in-out infinite' })}>💗</span>}
      {isDog && <span style={abs({ left: 8, top: 120, fontSize: 18, animation: 'sway 1.6s ease-in-out infinite' })}>⚡</span>}
      {isCat && <span style={abs({ left: 10, top: 132, fontSize: 17, animation: 'sway 3.4s ease-in-out infinite' })}>✏️</span>}
    </div>
  );

  if (scale && scale !== 1) {
    return (
      <span
        style={{
          display: 'block',
          width: 200 * scale,
          height: 250 * scale,
          overflow: 'hidden',
        }}
      >
        <span style={{ display: 'block', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {art}
        </span>
      </span>
    );
  }

  return art;
}
