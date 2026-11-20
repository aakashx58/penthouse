import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Navbar, type NavSection } from './components/Navbar';
import { HeroOverlay } from './components/HeroOverlay';
import { computeImageWidth, getMediaUrls } from './media';

const LETTERS = ['S', 'u', 'm', 'm', 'i', 't'] as const;
const TOTAL_DURATION_MS = 7400;
const RAIN_CLIP_CUTOFF_S = 3.6;
const RAIN_SWAP_BEFORE_S = 0.75;

interface HeadlineMetrics {
  wordFontSize: number;
  wordTop: number;
  kickerFontSize: number;
  kickerTop: number;
  kickerShiftPx: number;
}

export default function App() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const [phase, setPhase] = useState<'intro' | 'rest'>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'rest'
      : 'intro'
  );

  const [activeSection, setActiveSection] = useState<NavSection>('Home');
  const [language, setLanguage] = useState<string>('Eng');
  const [enquireOpen, setEnquireOpen] = useState<boolean>(false);

  const [imgWidth] = useState<number>(() =>
    typeof window !== 'undefined'
      ? computeImageWidth(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1)
      : 2000
  );

  const media = useMemo(() => getMediaUrls(imgWidth), [imgWidth]);

  const [headlineMetrics, setHeadlineMetrics] = useState<HeadlineMetrics>({
    wordFontSize: 290,
    wordTop: 140,
    kickerFontSize: 34.2,
    kickerTop: 170,
    kickerShiftPx: -29,
  });

  const heroRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const backLayerRef = useRef<HTMLDivElement | null>(null);
  const midLayerRef = useRef<HTMLDivElement | null>(null);
  const frontLayerRef = useRef<HTMLDivElement | null>(null);
  const topShadeRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const kickerRef = useRef<HTMLSpanElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const openingRef = useRef<HTMLDivElement | null>(null);
  const tiltVideoRef = useRef<HTMLVideoElement | null>(null);
  const leftDoorRef = useRef<HTMLDivElement | null>(null);
  const rightDoorRef = useRef<HTMLDivElement | null>(null);

  const aerialImgRef = useRef<HTMLImageElement | null>(null);
  const backImgRef = useRef<HTMLImageElement | null>(null);
  const midImgRef = useRef<HTMLImageElement | null>(null);
  const frontImgRef = useRef<HTMLImageElement | null>(null);

  const rainARef = useRef<HTMLVideoElement | null>(null);
  const rainBRef = useRef<HTMLVideoElement | null>(null);
  const activeRainRef = useRef<'A' | 'B'>('A');
  const rainSwappingRef = useRef<boolean>(false);
  const rainPauseTimerRef = useRef<number | null>(null);
  const rainStartedRef = useRef<boolean>(false);

  const measureWordRef = useRef<HTMLSpanElement | null>(null);
  const measureStrutRef = useRef<HTMLSpanElement | null>(null);
  const fontMetricsRef = useRef<{ widthPerEm: number; baselineFromTopPerEm: number }>({
    widthPerEm: 3.4,
    baselineFromTopPerEm: 0.85,
  });

  const animationsRef = useRef<Animation[]>([]);
  const introStartedRef = useRef<boolean>(false);

  // Measure the 16:9 stage, u unit, and headline baseline/size
  const updateLayout = useCallback(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const heroW = heroEl.clientWidth || vw;
    const heroH = heroEl.clientHeight || Math.max(vh, 520);

    const u = vw < 820 ? 1 : Math.min(vw / 1440, vh / 900);
    const stageW = Math.max(heroW, heroH * (16 / 9));
    const stageH = stageW * (9 / 16);

    heroEl.style.setProperty('--u', `${u}px`);
    heroEl.style.setProperty('--vw', `${heroW}px`);
    heroEl.style.setProperty('--stage-w', `${stageW}px`);
    heroEl.style.setProperty('--stage-h', `${stageH}px`);

    if (measureWordRef.current && measureStrutRef.current) {
      const wordRect = measureWordRef.current.getBoundingClientRect();
      const strutRect = measureStrutRef.current.getBoundingClientRect();
      if (wordRect.width > 0) {
        fontMetricsRef.current = {
          widthPerEm: wordRect.width / 100,
          baselineFromTopPerEm: (strutRect.bottom - wordRect.top) / 100,
        };
      }
    }

    const { widthPerEm, baselineFromTopPerEm } = fontMetricsRef.current;
    const isPortrait = heroH > 1.2 * heroW;
    const baselineInStage = (isPortrait ? 0.362 : 0.43) * stageH;
    const stageTopInHero = (heroH - stageH) / 2;
    const baselineInHero = stageTopInHero + baselineInStage;

    const navBottomInHero = vh <= 500 ? 46 : vw < 820 ? 104 : 100 * u;
    const gap = Math.max(36, baselineInHero - (navBottomInHero + 0.035 * vh));

    const sizeA = (0.625 * stageW) / widthPerEm;
    const sizeB = (0.92 * heroW) / widthPerEm;
    const sizeC = gap / 0.88;
    const wordFontSize = Math.min(sizeA, sizeB, sizeC);

    const wordTop = baselineInStage - wordFontSize * baselineFromTopPerEm;
    const kickerFontSize = 0.118 * wordFontSize;
    const kickerTop = baselineInStage - (0.727 + 0.02) * wordFontSize;
    const kickerShiftPx = -0.1 * wordFontSize;

    setHeadlineMetrics({
      wordFontSize,
      wordTop,
      kickerFontSize,
      kickerTop,
      kickerShiftPx,
    });
  }, []);

  useEffect(() => {
    updateLayout();
    let mounted = true;

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted) updateLayout();
      });
    }

    const onResize = () => updateLayout();
    window.addEventListener('resize', onResize);

    let ro: ResizeObserver | null = null;
    if (heroRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => updateLayout());
      ro.observe(heroRef.current);
    }

    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [updateLayout]);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        animationsRef.current.forEach((a) => a.cancel());
        animationsRef.current = [];
        rainARef.current?.pause();
        rainBRef.current?.pause();
        tiltVideoRef.current?.pause();
        rainARef.current?.classList.remove('is-on');
        rainBRef.current?.classList.remove('is-on');
        if (backLayerRef.current) {
          backLayerRef.current.style.transform = 'translateY(-1.5%)';
        }
        setPhase('rest');
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Rain loop controller (Section 9)
  const startRainLoop = useCallback(() => {
    if (rainStartedRef.current || prefersReducedMotion) return;
    rainStartedRef.current = true;

    const rainA = rainARef.current;
    const rainB = rainBRef.current;
    if (!rainA || !rainB) return;

    activeRainRef.current = 'A';
    rainSwappingRef.current = false;
    rainA.style.zIndex = '2';
    rainB.style.zIndex = '1';
    rainA.currentTime = 0;
    rainA.classList.add('is-on');
    rainA.play().catch(() => {});
  }, [prefersReducedMotion]);

  const handleRainTimeUpdate = useCallback(
    (which: 'A' | 'B') => {
      if (prefersReducedMotion || !rainStartedRef.current) return;
      if (activeRainRef.current !== which || rainSwappingRef.current) return;

      const current = which === 'A' ? rainARef.current : rainBRef.current;
      const other = which === 'A' ? rainBRef.current : rainARef.current;
      if (!current || !other) return;

      if (current.currentTime >= RAIN_CLIP_CUTOFF_S - RAIN_SWAP_BEFORE_S) {
        rainSwappingRef.current = true;
        const nextKey = which === 'A' ? 'B' : 'A';
        activeRainRef.current = nextKey;

        other.style.zIndex = '2';
        current.style.zIndex = '1';
        other.currentTime = 0;
        other.play().catch(() => {});
        other.classList.add('is-on');
        current.classList.remove('is-on');

        if (rainPauseTimerRef.current !== null) {
          window.clearTimeout(rainPauseTimerRef.current);
        }
        rainPauseTimerRef.current = window.setTimeout(() => {
          current.pause();
          rainSwappingRef.current = false;
        }, 800);
      }
    },
    [prefersReducedMotion]
  );

  // Master 7.4s Web Animation timeline (Section 8)
  useEffect(() => {
    if (prefersReducedMotion) {
      if (backLayerRef.current) {
        backLayerRef.current.style.transform = 'translateY(-1.5%)';
      }
      setPhase('rest');
      return;
    }

    let rafId: number | null = null;
    let readyPauseTimer: number | null = null;
    let failsafeTimer: number | null = null;
    let unmounted = false;

    const createAnim = (
      el: Element | null,
      keyframes: Keyframe[]
    ): Animation | null => {
      if (!el) return null;
      const anim = el.animate(keyframes, {
        duration: TOTAL_DURATION_MS,
        fill: 'both',
      });
      anim.pause();
      anim.currentTime = 0;
      return anim;
    };

    const startIntro = () => {
      if (unmounted || introStartedRef.current) return;
      introStartedRef.current = true;

      if (readyPauseTimer !== null) window.clearTimeout(readyPauseTimer);
      if (failsafeTimer !== null) window.clearTimeout(failsafeTimer);

      const D = TOTAL_DURATION_MS;
      const anims: Animation[] = [];
      const add = (anim: Animation | null) => {
        if (anim) anims.push(anim);
      };

      // 0.02 -> 1.13 Left door
      add(
        createAnim(leftDoorRef.current, [
          { offset: 0, transform: 'translateX(0)' },
          {
            offset: 20 / D,
            transform: 'translateX(0)',
            easing: 'cubic-bezier(0.1, 0.2, 0.8, 1)',
          },
          { offset: 1130 / D, transform: 'translateX(-101%)' },
          { offset: 1, transform: 'translateX(-101%)' },
        ])
      );

      // 0.02 -> 1.24 Right door
      add(
        createAnim(rightDoorRef.current, [
          { offset: 0, transform: 'translateX(0)' },
          {
            offset: 20 / D,
            transform: 'translateX(0)',
            easing: 'cubic-bezier(0.4, 0.6, 0.9, 1)',
          },
          { offset: 1240 / D, transform: 'translateX(101%)' },
          { offset: 1, transform: 'translateX(101%)' },
        ])
      );

      // 1.19 -> 1.47 Tilt video opacity 0 -> 1
      add(
        createAnim(tiltVideoRef.current, [
          { offset: 0, opacity: 0 },
          { offset: 1190 / D, opacity: 0, easing: 'ease-in-out' },
          { offset: 1470 / D, opacity: 1 },
          { offset: 1, opacity: 1 },
        ])
      );

      // 2.45 -> 2.95 Opening box opacity 1 -> 0
      add(
        createAnim(openingRef.current, [
          { offset: 0, opacity: 1 },
          {
            offset: 2450 / D,
            opacity: 1,
            easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
          },
          { offset: 2950 / D, opacity: 0 },
          { offset: 1, opacity: 0 },
        ])
      );

      // 2.45 -> 2.75 Nav opacity 0 -> 1, translateY -6px -> 0
      add(
        createAnim(navRef.current, [
          { offset: 0, opacity: 0, transform: 'translateY(-6px)' },
          {
            offset: 2450 / D,
            opacity: 0,
            transform: 'translateY(-6px)',
            easing: 'ease-out',
          },
          { offset: 2750 / D, opacity: 1, transform: 'translateY(0)' },
          { offset: 1, opacity: 1, transform: 'translateY(0)' },
        ])
      );

      // 2.45 -> 3.10 Kicker opacity 0 -> 1, translate 0 0.5em -> 0
      add(
        createAnim(kickerRef.current, [
          { offset: 0, opacity: 0, transform: 'translateY(0.5em)' },
          {
            offset: 2450 / D,
            opacity: 0,
            transform: 'translateY(0.5em)',
            easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)',
          },
          { offset: 3100 / D, opacity: 1, transform: 'translateY(0)' },
          { offset: 1, opacity: 1, transform: 'translateY(0)' },
        ])
      );

      // 2.45 + i * 0.054 -> +0.70 Letters S, u, m, m, i, t
      LETTERS.forEach((_, i) => {
        const start = 2450 + i * 54;
        const end = start + 700;
        add(
          createAnim(letterRefs.current[i] ?? null, [
            { offset: 0, opacity: 0, transform: 'translateY(0.14em)' },
            {
              offset: start / D,
              opacity: 0,
              transform: 'translateY(0.14em)',
              easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)',
            },
            { offset: end / D, opacity: 1, transform: 'translateY(0)' },
            { offset: 1, opacity: 1, transform: 'translateY(0)' },
          ])
        );
      });

      // 2.90 -> 3.70 Top shade opacity 0 -> 1
      add(
        createAnim(topShadeRef.current, [
          { offset: 0, opacity: 0 },
          { offset: 2900 / D, opacity: 0, easing: 'ease-in-out' },
          { offset: 3700 / D, opacity: 1 },
          { offset: 1, opacity: 1 },
        ])
      );

      // 2.90 -> 4.30 Back layer translateY 0 -> -1.5%
      add(
        createAnim(backLayerRef.current, [
          { offset: 0, transform: 'translateY(0%)' },
          {
            offset: 2900 / D,
            transform: 'translateY(0%)',
            easing: 'cubic-bezier(0.45, 0, 0.35, 1)',
          },
          { offset: 4300 / D, transform: 'translateY(-1.5%)' },
          { offset: 1, transform: 'translateY(-1.5%)' },
        ])
      );

      // 2.90 -> 4.30 -> 4.60 -> 6.90 Mid layer
      add(
        createAnim(midLayerRef.current, [
          { offset: 0, transform: 'translateY(0%)' },
          {
            offset: 2900 / D,
            transform: 'translateY(0%)',
            easing: 'cubic-bezier(0.45, 0, 0.3, 1)',
          },
          { offset: 4300 / D, transform: 'translateY(-4%)' },
          {
            offset: 4600 / D,
            transform: 'translateY(-4%)',
            easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
          },
          { offset: 6900 / D, transform: 'translateY(0%)' },
          { offset: 1, transform: 'translateY(0%)' },
        ])
      );

      // 3.00 -> 4.80 Headline block translateY 6% -> 0
      add(
        createAnim(headlineRef.current, [
          { offset: 0, transform: 'translateY(6%)' },
          {
            offset: 3000 / D,
            transform: 'translateY(6%)',
            easing: 'cubic-bezier(0.3, 0, 0.4, 1)',
          },
          { offset: 4800 / D, transform: 'translateY(0%)' },
          { offset: 1, transform: 'translateY(0%)' },
        ])
      );

      // 3.35 -> 6.00 -> 7.30 Front layer
      add(
        createAnim(frontLayerRef.current, [
          { offset: 0, transform: 'translateY(66%)' },
          {
            offset: 3350 / D,
            transform: 'translateY(66%)',
            easing: 'cubic-bezier(0.2, 0.5, 0.2, 1)',
          },
          {
            offset: 6000 / D,
            transform: 'translateY(-2.5%)',
            easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
          },
          { offset: 7300 / D, transform: 'translateY(0%)' },
          { offset: 1, transform: 'translateY(0%)' },
        ])
      );

      animationsRef.current = anims;

      const startTime = performance.now();
      let tiltStarted = false;
      let tiltPaused = false;

      const tick = (now: number) => {
        if (unmounted) return;
        const elapsed = Math.min(D, now - startTime);

        for (let i = 0; i < anims.length; i++) {
          anims[i].currentTime = elapsed;
        }

        // Tilt video playback window: 1.25s -> 2.85s (1.6s window)
        const tilt = tiltVideoRef.current;
        if (tilt) {
          const clipLen =
            Number.isFinite(tilt.duration) && tilt.duration > 0 ? tilt.duration : 5.04;
          const baseRate = clipLen / 1.6;

          if (elapsed >= 1250 && elapsed < 2850) {
            if (!tiltStarted) {
              tiltStarted = true;
              tilt.currentTime = 0;
              tilt.playbackRate = baseRate;
              tilt.play().catch(() => {});
            } else if (tilt.paused) {
              tilt.play().catch(() => {});
            }

            const targetTime = ((elapsed - 1250) / 1600) * clipLen;
            const drift = targetTime - tilt.currentTime;
            const nudged = baseRate + drift * 2.5;
            const clamped = Math.max(baseRate * 0.85, Math.min(baseRate * 1.2, nudged));

            if (Math.abs(drift) > 0.45) {
              try {
                tilt.currentTime = targetTime;
              } catch {
                // ignore seek error before metadata
              }
            }
            try {
              tilt.playbackRate = clamped;
            } catch {
              // ignore unsupported rate
            }
          } else if (elapsed >= 2850 && !tiltPaused) {
            tiltPaused = true;
            tilt.pause();
            try {
              tilt.currentTime = clipLen;
            } catch {
              // ignore
            }
          }
        }

        // Start rain loop at 2.40s
        if (elapsed >= 2400 && !rainStartedRef.current) {
          startRainLoop();
        }

        if (elapsed < D) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          // Commit final resting state before removing intro and hiding opening/doors
          if (backLayerRef.current) {
            backLayerRef.current.style.transform = 'translateY(-1.5%)';
          }
          if (midLayerRef.current) {
            midLayerRef.current.style.transform = 'translateY(0%)';
          }
          if (frontLayerRef.current) {
            frontLayerRef.current.style.transform = 'translateY(0%)';
          }
          if (headlineRef.current) {
            headlineRef.current.style.transform = 'translateY(0%)';
          }
          if (topShadeRef.current) {
            topShadeRef.current.style.opacity = '1';
          }
          if (navRef.current) {
            navRef.current.style.opacity = '1';
            navRef.current.style.transform = 'translateY(0)';
          }
          if (kickerRef.current) {
            kickerRef.current.style.opacity = '1';
            kickerRef.current.style.transform = 'translateY(0)';
          }
          letterRefs.current.forEach((el) => {
            if (el) {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }
          });
          anims.forEach((a) => a.cancel());
          animationsRef.current = [];
          setPhase('rest');
        }
      };

      rafId = window.requestAnimationFrame(tick);
    };

    // Asset readiness gate: door image, aerial, back, mid, front, and tilt video (canplaythrough) + 120ms pause
    const waitImg = (img: HTMLImageElement | null): Promise<void> =>
      new Promise((resolve) => {
        if (!img) return resolve();
        if (img.complete && img.naturalWidth > 0) return resolve();
        const done = () => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
          resolve();
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });

    const waitUrlImage = (src: string): Promise<void> =>
      new Promise((resolve) => {
        const loader = new Image();
        loader.onload = () => resolve();
        loader.onerror = () => resolve();
        loader.src = src;
        if (loader.complete && loader.naturalWidth > 0) resolve();
      });

    const waitVideo = (video: HTMLVideoElement | null): Promise<void> =>
      new Promise((resolve) => {
        if (!video) return resolve();
        if (video.readyState >= 4) return resolve();
        const done = () => {
          video.removeEventListener('canplaythrough', done);
          video.removeEventListener('error', done);
          resolve();
        };
        video.addEventListener('canplaythrough', done, { once: true });
        video.addEventListener('error', done, { once: true });
      });

    Promise.all([
      waitUrlImage(media.doors),
      waitImg(aerialImgRef.current),
      waitImg(backImgRef.current),
      waitImg(midImgRef.current),
      waitImg(frontImgRef.current),
      waitVideo(tiltVideoRef.current),
    ]).then(() => {
      if (unmounted || introStartedRef.current) return;
      readyPauseTimer = window.setTimeout(startIntro, 120);
    });

    // 5s failsafe
    failsafeTimer = window.setTimeout(startIntro, 5000);

    return () => {
      unmounted = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (readyPauseTimer !== null) window.clearTimeout(readyPauseTimer);
      if (failsafeTimer !== null) window.clearTimeout(failsafeTimer);
      if (rainPauseTimerRef.current !== null) window.clearTimeout(rainPauseTimerRef.current);
      animationsRef.current.forEach((a) => a.cancel());
      animationsRef.current = [];
    };
  }, [media.doors, prefersReducedMotion, startRainLoop]);

  const handleCloseOverlay = useCallback(() => {
    setEnquireOpen(false);
    setActiveSection('Home');
  }, []);

  return (
    <main>
      <div
        ref={heroRef}
        className={`hero ${phase === 'intro' ? 'intro' : 'is-rest'}`}
      >
        {/* Offscreen font measurement probe for exact 100px Inter "Summit" metrics */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',
            width: 'max-content',
            visibility: 'hidden',
            pointerEvents: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: '100px',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
          ref={measureWordRef}
        >
          {LETTERS.map((char, idx) => (
            <span key={idx} style={{ display: 'inline-block' }}>
              {char}
            </span>
          ))}
          <span
            ref={measureStrutRef}
            style={{
              display: 'inline-block',
              width: 0,
              height: 0,
              verticalAlign: 'baseline',
            }}
          />
        </span>

        {/* 16:9 Stage centered in hero */}
        <div className="stage">
          {/* 1. Back layer: back image, two rain videos, and top shade */}
          <div ref={backLayerRef} className="scene-layer scene-layer--back">
            <img
              ref={backImgRef}
              src={media.back}
              alt=""
              className="scene-media"
              decoding="async"
              fetchPriority="high"
            />
            <video
              ref={rainARef}
              src={media.rainVideo}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="scene-media rain-video"
              onTimeUpdate={() => handleRainTimeUpdate('A')}
            />
            <video
              ref={rainBRef}
              src={media.rainVideo}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="scene-media rain-video"
              onTimeUpdate={() => handleRainTimeUpdate('B')}
            />
            <div ref={topShadeRef} className="top-shade" />
          </div>

          {/* 2. Headline block: horizontally centered on viewport, between back and mid */}
          <div className="headline-viewport-wrap">
            <div ref={headlineRef} className="headline-block">
              <div
                className="headline-kicker-pos"
                style={{
                  top: `${headlineMetrics.kickerTop}px`,
                  transform: `translateX(calc(-50% + ${headlineMetrics.kickerShiftPx}px))`,
                }}
              >
                <span
                  ref={kickerRef}
                  aria-hidden="true"
                  className="headline-kicker"
                  style={{ fontSize: `${headlineMetrics.kickerFontSize}px` }}
                >
                  Claim Your
                </span>
              </div>

              <h1
                aria-label="Claim Your Summit"
                className="headline-word"
                style={{
                  top: `${headlineMetrics.wordTop}px`,
                  fontSize: `${headlineMetrics.wordFontSize}px`,
                }}
              >
                {LETTERS.map((char, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      letterRefs.current[i] = el;
                    }}
                    aria-hidden="true"
                    className="headline-letter"
                  >
                    {char}
                  </span>
                ))}
              </h1>
            </div>
          </div>

          {/* 3. Mid layer: city skyline */}
          <div ref={midLayerRef} className="scene-layer scene-layer--mid">
            <img
              ref={midImgRef}
              src={media.mid}
              alt="Rainy neon harbour skyline at night"
              className="scene-media"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* 4. Front layer: glass tint panel, then front image above it */}
          <div ref={frontLayerRef} className="scene-layer scene-layer--front">
            <div className="glass-tint" aria-hidden="true" />
            <img
              ref={frontImgRef}
              src={media.front}
              alt="Penthouse glass balcony terrace overlooking the harbour"
              className="scene-media"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>

        {/* Nav pinned to the viewport */}
        <Navbar
          navRef={navRef}
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            if (sec === 'Home') setEnquireOpen(false);
          }}
          language={language}
          onSelectLanguage={setLanguage}
          onEnquire={() => setEnquireOpen(true)}
        />

        {/* Opening layers (z-index 6) */}
        <div ref={openingRef} className="opening" aria-hidden="true">
          <img
            ref={aerialImgRef}
            src={media.aerial}
            alt=""
            className="scene-media"
            decoding="async"
            fetchPriority="high"
          />
          <video
            ref={tiltVideoRef}
            src={media.tiltVideo}
            muted
            playsInline
            preload="auto"
            className="scene-media opening-video"
          />
        </div>

        {/* Doors (z-index 7) */}
        <div className="doors" aria-hidden="true">
          <div
            ref={leftDoorRef}
            className="door-panel door-panel--left"
            style={{ backgroundImage: `url("${media.doors}")` }}
          />
          <div
            ref={rightDoorRef}
            className="door-panel door-panel--right"
            style={{ backgroundImage: `url("${media.doors}")` }}
          />
        </div>

        <HeroOverlay
          activeSection={activeSection}
          enquireOpen={enquireOpen}
          onClose={handleCloseOverlay}
          onOpenEnquire={() => setEnquireOpen(true)}
        />
      </div>
    </main>
  );
}
