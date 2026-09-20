import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimalKey, AnimalType, COMPAT, ORDER, QUESTIONS, TYPES } from './data';
import { makeResultCard, saveCard, shareCard } from './resultCard';

export type Screen =
  | 'home'
  | 'quiz'
  | 'loading'
  | 'result'
  | 'invite'
  | 'map'
  | 'compare';

interface State {
  screen: Screen;
  qi: number;
  scores: Partial<Record<AnimalKey, number>>;
  homeIdx: number;
  result: AnimalKey | null;
  friend: AnimalKey | null;
  // 결과 화면 초대장 편지를 이미 한 번 띄웠는지 (자동 팝업은 결과당 한 번만)
  inviteSeen: boolean;
  toast: string;
  // 공유 시트/다운로드 창에 가리지 않게 화면 위쪽에 띄우는 안내 토스트인지
  toastTop: boolean;
  cardPreview: string | null;
}

// 현재까지의 점수(scores)에서 "공동 1등"인 동물들을 전부 반환.
// (문항 5개 · 문항당 1점이면 수학적으로 3파전은 불가능 — 최대 2파전까지만 나옴)
function getLeaders(scores: Partial<Record<AnimalKey, number>>): AnimalKey[] {
  const pairs = ORDER.map((k) => [k, scores[k] ?? 0] as const);
  const top = Math.max(...pairs.map(([, v]) => v));
  return pairs.filter(([, v]) => v === top).map(([k]) => k);
}

export function useTest() {
  const [state, setState] = useState<State>({
    screen: 'home',
    qi: 0,
    scores: {},
    homeIdx: 0,
    result: null,
    friend: null,
    inviteSeen: false,
    toast: '',
    toastTop: false,
    cardPreview: null,
  });

  const patch = useCallback((p: Partial<State> | ((s: State) => Partial<State>)) => {
    setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }));
  }, []);

  const toastTimer = useRef<number | undefined>(undefined);
  const loadTimer = useRef<number | undefined>(undefined);
  const rotateTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string, opts?: { top?: boolean; ms?: number }) => {
    window.clearTimeout(toastTimer.current);
    setState((s) => ({ ...s, toast: msg, toastTop: opts?.top ?? false }));
    toastTimer.current = window.setTimeout(
      () => setState((s) => ({ ...s, toast: '' })),
      opts?.ms ?? 2200,
    );
  }, []);

  const hideToast = useCallback(() => {
    window.clearTimeout(toastTimer.current);
    setState((s) => ({ ...s, toast: '' }));
  }, []);

  const go = useCallback((screen: Screen) => {
    setState((s) => ({ ...s, screen }));
    window.scrollTo(0, 0);
  }, []);

  // home mascot auto-rotate
  useEffect(() => {
    rotateTimer.current = window.setInterval(() => {
      setState((s) =>
        s.screen === 'home' ? { ...s, homeIdx: (s.homeIdx + 1) % ORDER.length } : s,
      );
    }, 2600);
    return () => {
      window.clearInterval(rotateTimer.current);
      window.clearTimeout(loadTimer.current);
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  const pick = useCallback(
    (w: Partial<Record<AnimalKey, number>>) => {
      setState((s) => {
        const scores = { ...s.scores };
        (Object.keys(w) as AnimalKey[]).forEach((k) => {
          scores[k] = (scores[k] ?? 0) + (w[k] ?? 0);
        });
        const next = s.qi + 1;

        // 로딩 화면 보여주고 1.6초 뒤 최종 결과(1등 동물) 계산하는 공통 로직
        const finish = () => {
          window.clearTimeout(loadTimer.current);
          loadTimer.current = window.setTimeout(() => {
            setState((cur) => {
              let best: AnimalKey = ORDER[0];
              ORDER.forEach((k) => {
                if ((cur.scores[k] ?? 0) > (cur.scores[best] ?? 0)) best = k;
              });
              return { ...cur, result: best, screen: 'result' };
            });
            window.scrollTo(0, 0);
          }, 1600);
        };

        // Q5(끝에서 두 번째 문항)까지 답한 직후: 1등이 동점이면 Q6(타이브레이커)로,
        // 동점이 아니면 Q6 없이 바로 결과로 직행
        if (next === QUESTIONS.length - 1) {
          const leaders = getLeaders(scores);
          if (leaders.length > 1) {
            window.scrollTo(0, 0);
            return { ...s, scores, qi: next };
          }
          finish();
          return { ...s, scores, screen: 'loading' };
        }

        // 마지막 문항(Q6)까지 답한 직후: 동점 체크 없이 무조건 결과로
        if (next === QUESTIONS.length) {
          finish();
          return { ...s, scores, screen: 'loading' };
        }

        // 그 외 문항: 그냥 다음 문항으로
        window.scrollTo(0, 0);
        return { ...s, scores, qi: next };
      });
    },
    [],
  );

  const back = useCallback(() => {
    setState((s) => {
      if (s.screen === 'quiz') {
        if (s.qi === 0) {
          window.scrollTo(0, 0);
          return { ...s, screen: 'home' };
        }
        return { ...s, qi: s.qi - 1 };
      }
      if (s.screen === 'invite') {
        window.scrollTo(0, 0);
        return { ...s, screen: 'home' };
      }
      window.scrollTo(0, 0);
      return { ...s, screen: s.result ? 'result' : 'home' };
    });
  }, []);

  const start = useCallback(() => {
    setState((s) => ({ ...s, qi: 0, scores: {}, result: null, inviteSeen: false, screen: 'quiz' }));
    window.scrollTo(0, 0);
  }, []);

  const restart = useCallback(() => {
    setState((s) => ({
      ...s,
      qi: 0,
      scores: {},
      result: null,
      friend: null,
      inviteSeen: false,
      screen: 'home',
    }));
    window.scrollTo(0, 0);
  }, []);

  // 결과가 나오면 카드 이미지를 미리 만들어 둠 — iOS는 버튼 탭 직후에 바로 공유 시트를
  // 열어야 해서, 탭한 뒤에 그리기 시작하면 시간이 걸려 공유가 거부될 수 있음
  const cardRef = useRef<{ key: AnimalKey; blob: Promise<Blob> } | null>(null);
  const busyRef = useRef(false);

  const ensureCard = useCallback((key: AnimalKey) => {
    if (cardRef.current?.key !== key) {
      const blob = makeResultCard(TYPES[key]);
      blob.catch(() => {});
      cardRef.current = { key, blob };
    }
    return cardRef.current.blob;
  }, []);

  useEffect(() => {
    if (state.result) ensureCard(state.result);
  }, [state.result, ensureCard]);

  const showCardPreview = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setState((s) => {
      if (s.cardPreview) URL.revokeObjectURL(s.cardPreview);
      return { ...s, cardPreview: url };
    });
  }, []);

  // 저장/공유 버튼 공통: 연타 막고, 카드 이미지 준비되면 fn 실행
  const withCard = useCallback(
    async (fn: (blob: Blob, filename: string, res: AnimalType) => Promise<void>) => {
      if (busyRef.current) return;
      busyRef.current = true;
      const key = state.result ?? 'dog';
      try {
        let blob: Blob;
        try {
          blob = await ensureCard(key);
        } catch {
          cardRef.current = null;
          toast('이미지를 만들지 못했어. 다시 눌러줘!');
          return;
        }
        const res = TYPES[key];
        await fn(blob, `내-성격-동물_${res.name.replace(/\s+/g, '-')}.png`, res);
      } finally {
        busyRef.current = false;
      }
    },
    [state.result, ensureCard, toast],
  );

  const share = useCallback(
    () =>
      withCard(async (blob, filename, res) => {
        const text = `내 성격 동물은 「${res.name}」! 너도 해봐 ${location.href}`;
        const outcome = await shareCard(blob, filename, text);
        if (outcome !== 'unsupported') return;

        // 이미지 공유가 안 되는 브라우저: 링크는 복사하고, 이미지는 저장해서 직접 올릴 수 있게
        const copied = await navigator.clipboard?.writeText(text).then(
          () => true,
          () => false,
        );
        const saved = await saveCard(blob, filename);
        if (saved === 'saved') toast(copied ? '이미지를 저장하고 링크를 복사했어!' : '결과 카드를 저장했어! 📷');
        if (saved === 'preview') {
          showCardPreview(blob);
          if (copied) toast('링크를 복사했어!');
        }
      }),
    [withCard, showCardPreview, toast],
  );

  const saveImage = useCallback(
    () =>
      withCard(async (blob, filename) => {
        const outcome = await saveCard(blob, filename, () => {
          // 아이폰 공유 시트가 뜨기 "직전"에 안내를 화면에 그려둔다.
          // flushSync 없이 setState만 하면 시트가 먼저 떠서 안내를 못 보고 지나감.
          flushSync(() => toast("여기서 '이미지 저장' 📷 을 눌러줘!", { top: true, ms: 7000 }));
        });
        if (outcome === 'saved') toast('사진첩에 저장했어! 📷');
        if (outcome === 'cancelled') hideToast();
        if (outcome === 'preview') showCardPreview(blob);
      }),
    [withCard, showCardPreview, toast, hideToast],
  );

  const closeCardPreview = useCallback(() => {
    setState((s) => {
      if (s.cardPreview) URL.revokeObjectURL(s.cardPreview);
      return { ...s, cardPreview: null };
    });
  }, []);

  const derived = useMemo(() => {
    const res = TYPES[state.result ?? 'dog'];
    const homeChar = TYPES[ORDER[state.homeIdx]];

    let question = QUESTIONS[state.qi] ?? QUESTIONS[0];
    // Q6(마지막 문항)은 Q1~5가 동점이었을 때만 등장하는 타이브레이커라,
    // 그 동점이었던 두 동물의 보기만 남겨서 무조건 승부가 갈리게 만듦
    if (state.qi === QUESTIONS.length - 1) {
      const leaders = getLeaders(state.scores);
      if (leaders.length > 1) {
        const narrowedOpts = question.opts.filter((opt) =>
          (Object.keys(opt.w) as AnimalKey[]).some((k) => leaders.includes(k)),
        );
        if (narrowedOpts.length > 0) {
          question = { ...question, opts: narrowedOpts };
        }
      }
    }

    const compatKey = state.friend
      ? [state.result ?? 'dog', state.friend].sort().join('-')
      : null;
    const compat = compatKey ? COMPAT[compatKey] ?? COMPAT['cat-dog'] : null;

    return {
      res,
      homeChar,
      question,
      qNumber: state.qi + 1,
      qLabel: `${state.qi + 1} / ${QUESTIONS.length}`,
      progressPct: `${Math.round((state.qi / QUESTIONS.length) * 100)}%`,
      compat,
      entryCode: `UNI-1024-${res.key.toUpperCase()}`,
    };
  }, [state.result, state.homeIdx, state.qi, state.friend, state.scores]);

  return {
    state,
    ...derived,
    setFriend: (k: AnimalKey) => patch({ friend: k }),
    seeInvite: () => patch({ inviteSeen: true }),
    pick,
    back,
    go,
    goInvite: () => go('invite'),
    goMap: () => go('map'),
    goCompare: () => go('compare'),
    start,
    restart,
    share,
    saveImage,
    closeCardPreview,
    toast,
  };
}

export type TestApi = ReturnType<typeof useTest>;
