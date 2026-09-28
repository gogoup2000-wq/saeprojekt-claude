// 01 히어로 — 노브 조작, 가상 사무실 상태 전환, 헤드라인 조립, 셰이더 배경
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { SplitText } from 'gsap/SplitText';
import { canAnimate, canUseShader, isMobile, EASE, DUR } from './motion';

gsap.registerPlugin(Draggable, SplitText);

const MIN_ROT = -135;
const MAX_ROT = 135;
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
/** a~b 구간에서 0→1로 올라가는 값 */
const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export function initHero(): void {
  const root = document.querySelector<HTMLElement>('[data-hero]');
  if (!root) return;

  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));

  const knob = $('[data-knob]');
  const rotor = $('[data-knob-rotor]');
  const ring = $('[data-knob-ring]');
  const valueEl = $('[data-knob-value]');
  const ticks = $$<SVGLineElement>('.tick');
  const arc = $<SVGSVGElement>('[data-arc]');
  const arcFill = $<SVGPathElement>('[data-arc-fill]');
  const arcThumb = $<SVGCircleElement>('[data-arc-thumb]');
  const arcValue = $<SVGTextElement>('[data-arc-value]');
  const office = $('[data-office]');
  const stateEl = $('[data-office-state]');
  const bubbles = $$('[data-bubble]');
  const missedEl = $('[data-missed]');
  const kcards = $$('[data-kcard]');
  const dashNums = $$('[data-dash]');
  const cta = $('[data-hero-cta]');
  const hint = $('[data-hint]');
  const headline = $('[data-split]');

  const animate = canAnimate();

  // 실제 값(target)과 화면 표시값(shown)을 분리 → 빨리 돌릴수록 카운터가 빨리 따라감
  const state = { target: 0, shown: 0 };
  let reached100 = false;
  let dashCounted = false;
  let lastInteract = performance.now();
  let interacted = false;

  // ── 화면 그리기 ──
  function render(v: number): void {
    const n = Math.round(v);
    const txt = String(n).padStart(3, '0');
    valueEl.textContent = txt;
    arcValue.textContent = txt;
    knob.setAttribute('aria-valuenow', String(n));
    arc.setAttribute('aria-valuenow', String(n));

    // 눈금: 값만큼 신호색
    const lit = Math.round((v / 100) * ticks.length);
    ticks.forEach((t, i) => t.classList.toggle('is-active', i < lit));

    // 모바일 반원
    arcFill.style.strokeDasharray = `${v} 100`;
    const th = Math.PI - (v / 100) * Math.PI;
    arcThumb.setAttribute('cx', String(150 + 130 * Math.cos(th)));
    arcThumb.setAttribute('cy', String(150 - 130 * Math.sin(th)));

    // 사무실 레이어 섞기
    const chaos = 1 - ramp(v, 15, 38);
    const order = ramp(v, 22, 40) * (1 - ramp(v, 66, 82));
    const calm = ramp(v, 68, 88);
    office.style.setProperty('--chaos', chaos.toFixed(3));
    office.style.setProperty('--order', order.toFixed(3));
    office.style.setProperty('--calm', calm.toFixed(3));
    office.style.setProperty('--shake', v < 30 ? ((30 - v) / 30).toFixed(3) : '0');
    stateEl.textContent = v < 30 ? '수작업' : v < 70 ? '정리 중' : '자동 운영';
    stateEl.style.color = v >= 70 ? 'var(--ok)' : '';

    // 30~70: 카드가 신규 → 배정 → 완료 컬럼으로 이동
    const counts = [0, 0, 0];
    kcards.forEach((c, i) => {
      const t1 = 32 + i * 5; // 배정 시작
      const t2 = 48 + i * 4; // 완료
      const col = v >= t2 ? 2 : v >= t1 ? 1 : 0;
      c.style.setProperty('--col', String(col));
      c.style.setProperty('--row', String(counts[col]++));
      c.classList.toggle('is-done', col === 2);
    });

    // 70~100: 대시보드 숫자
    if (calm > 0.6 && !dashCounted) {
      dashCounted = true;
      dashNums.forEach((el) => {
        const end = Number(el.dataset.dash);
        const o = { n: 0 };
        gsap.to(o, {
          n: end,
          duration: animate ? DUR.scene : 0,
          ease: EASE,
          onUpdate: () => (el.textContent = String(Math.round(o.n))),
        });
      });
    } else if (calm < 0.1 && dashCounted) {
      dashCounted = false;
      dashNums.forEach((el) => (el.textContent = '0'));
    }

    // 100 도달
    if (n >= 100 && !reached100) {
      reached100 = true;
      cta.classList.add('is-on');
      hint.style.visibility = 'hidden';
      if (animate) {
        gsap.fromTo(ring, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1.04, duration: 0.35, ease: EASE, yoyo: true, repeat: 1 });
      }
    }
  }

  // 표시값을 목표값으로 따라가게. speed(0~1)가 클수록 빨리
  function follow(speed = 0.3): void {
    if (!animate) {
      state.shown = state.target;
      render(state.shown);
      return;
    }
    gsap.to(state, {
      shown: state.target,
      duration: gsap.utils.interpolate(0.55, 0.06, clamp(speed)),
      ease: EASE,
      overwrite: true,
      onUpdate: () => render(state.shown),
    });
  }

  function setTarget(v: number, speed?: number, syncRotor = true): void {
    state.target = clamp(v, 0, 100);
    lastInteract = performance.now();
    interacted = true;
    if (syncRotor) gsap.set(rotor, { rotation: MIN_ROT + (state.target / 100) * (MAX_ROT - MIN_ROT) });
    follow(speed);
  }

  // ── 데스크톱 노브: GSAP Draggable (회전) ──
  let lastRot = MIN_ROT;
  let lastT = performance.now();
  gsap.set(rotor, { rotation: MIN_ROT });
  const [drag] = Draggable.create(rotor, {
    type: 'rotation',
    bounds: { minRotation: MIN_ROT, maxRotation: MAX_ROT },
    trigger: knob,
    onPress() {
      gsap.killTweensOf(rotor);
    },
    onDrag() {
      const now = performance.now();
      const speed = Math.abs(this.rotation - lastRot) / Math.max(1, now - lastT); // 도/ms
      lastRot = this.rotation;
      lastT = now;
      setTarget(((this.rotation - MIN_ROT) / (MAX_ROT - MIN_ROT)) * 100, speed / 1.5, false);
    },
  });

  // 키보드 조작 (접근성)
  function onKey(e: KeyboardEvent): void {
    const step = e.shiftKey ? 20 : 5;
    const map: Record<string, number> = {
      ArrowRight: state.target + step,
      ArrowUp: state.target + step,
      ArrowLeft: state.target - step,
      ArrowDown: state.target - step,
      PageUp: state.target + 20,
      PageDown: state.target - 20,
      Home: 0,
      End: 100,
    };
    if (e.key in map) {
      e.preventDefault();
      setTarget(map[e.key], 0.4);
      drag?.update();
    }
  }
  knob.addEventListener('keydown', onKey);
  arc.addEventListener('keydown', onKey);

  // ── 모바일 반원 슬라이더: 포인터 각도 → 값 ──
  function arcValueFromEvent(e: PointerEvent): number {
    const r = arc.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 300;
    const y = ((e.clientY - r.top) / r.height) * 170;
    let ang = Math.atan2(150 - y, x - 150); // 오른쪽 0, 위 π/2, 왼쪽 π
    if (ang < 0) ang = x < 150 ? Math.PI : 0; // 반원 아래로 내려가면 끝값에 고정
    return (1 - ang / Math.PI) * 100;
  }
  let arcActive = false;
  arc.addEventListener('pointerdown', (e) => {
    arcActive = true;
    arc.setPointerCapture(e.pointerId);
    setTarget(arcValueFromEvent(e), 0.5);
  });
  arc.addEventListener('pointermove', (e) => {
    if (arcActive) setTarget(arcValueFromEvent(e), 0.9);
  });
  const end = () => (arcActive = false);
  arc.addEventListener('pointerup', end);
  arc.addEventListener('pointercancel', end);

  // ── 모션 줄이기: 최종 상태만 정적으로 ──
  if (!animate) {
    ticks.forEach((t) => (t.style.opacity = '1'));
    setTarget(100);
    return;
  }

  render(0);

  // ── 등장: 헤드라인 글자 조립 → 눈금 시계방향 점등 ──
  document.fonts.ready.then(() => {
    const split = SplitText.create(headline, { type: 'chars,lines', mask: 'lines' });
    gsap.set(headline, { visibility: 'visible' });
    const tl = gsap.timeline();
    tl.from(split.chars, { yPercent: 110, opacity: 0, duration: 0.5, ease: EASE, stagger: 0.035 });
    tl.to(ticks, { opacity: 1, duration: 0.12, stagger: 0.025, ease: 'none' }, '-=0.15');
  });

  // ── 0~30 구간: 카톡 말풍선 쌓임, 놓친 전화 증가 ──
  let bubbleIdx = 0;
  let missed = 0;
  setInterval(() => {
    if (document.hidden || state.shown >= 30) return;
    if (bubbleIdx < bubbles.length) {
      bubbles[bubbleIdx++].classList.add('is-on');
    } else {
      // 다 쌓이면 가장 오래된 것부터 다시
      bubbles.forEach((b) => b.classList.remove('is-on'));
      bubbleIdx = 0;
    }
  }, 650);
  setInterval(() => {
    if (document.hidden || state.shown >= 30) return;
    missedEl.textContent = String(++missed);
  }, 1600);

  // ── 3초간 조작 없으면 노브가 살짝 흔들림 ──
  setInterval(() => {
    if (state.target >= 100 || performance.now() - lastInteract < 3000) return;
    if (root.getBoundingClientRect().bottom < 0) return;
    lastInteract = performance.now();
    const base = MIN_ROT + (state.target / 100) * (MAX_ROT - MIN_ROT);
    const target = isMobile() ? arcThumb : rotor;
    if (target === rotor) {
      gsap.timeline()
        .to(rotor, { rotation: base + 9, duration: 0.18, ease: 'sine.inOut' })
        .to(rotor, { rotation: base - 5, duration: 0.18, ease: 'sine.inOut' })
        .to(rotor, { rotation: base, duration: 0.3, ease: EASE });
    } else {
      gsap.fromTo(arcThumb, { scale: 1, transformOrigin: 'center' }, { scale: 1.25, duration: 0.2, yoyo: true, repeat: 3, ease: 'sine.inOut' });
    }
    if (!interacted) hint.animate([{ opacity: 1 }, { opacity: 0.4 }, { opacity: 1 }], { duration: 600 });
  }, 1000);

  // ── 셰이더 배경 (데스크톱·고사양만) ──
  if (canUseShader()) {
    const canvas = $<HTMLCanvasElement>('[data-hero-canvas]');
    import('./shader')
      .then(({ createHeroShader }) => {
        createHeroShader(canvas, root, () => state.shown / 100);
        canvas.classList.add('is-on');
      })
      .catch(() => {
        /* WebGL 실패 시 정지 배경 유지 */
      });
  }
}
