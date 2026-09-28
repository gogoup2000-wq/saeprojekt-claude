// 모션 공통 판단 — 모든 모션 코드는 시작 전에 여기를 확인한다.

const reduceQuery = '(prefers-reduced-motion: reduce)';
const mobileQuery = '(max-width: 767.98px), (pointer: coarse)';

/** 사용자가 OS에서 '동작 줄이기'를 켰으면 true → 모든 모션을 끄고 최종 상태만 보여준다 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(reduceQuery).matches;
}

/** 768px 미만이거나 터치 기기면 true → Lenis·셰이더를 끄고 가벼운 버전을 쓴다 */
export function isMobile(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches;
}

/** 저사양 추정: CPU 코어 4개 이하 또는 메모리 4GB 이하 → 셰이더 끔 */
export function isLowEnd(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}

/** GSAP 모션을 돌려도 되는가 (모션 줄이기가 아니면 true) */
export function canAnimate(): boolean {
  return !prefersReducedMotion();
}

/** 부드러운 스크롤(Lenis)을 켜도 되는가 */
export function canSmoothScroll(): boolean {
  return canAnimate() && !isMobile();
}

/** 히어로 셰이더(WebGL)를 켜도 되는가 */
export function canUseShader(): boolean {
  return canAnimate() && !isMobile() && !isLowEnd();
}

/** 설정이 바뀌면(예: 모션 줄이기 토글) 알려준다 */
export function onMotionPreferenceChange(cb: () => void): void {
  window.matchMedia(reduceQuery).addEventListener('change', cb);
}

/** GSAP 가속·감속 곡선 — CSS --ease(cubic-bezier(0.22,1,0.36,1), easeOutQuint)와 같은 곡선 */
export const EASE = 'power4.out';
/** 작은 반응 / 장면 전환 시간(초) */
export const DUR = { fast: 0.18, scene: 0.75 } as const;

/** 요소가 화면에 들어오면 한 번 실행 (ScrollTrigger 없이 가볍게) */
export function onceVisible(el: Element, cb: () => void, threshold = 0.35): void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { threshold },
  );
  io.observe(el);
}

/** 숫자를 1,234 형태로 */
export const fmt = (n: number, digits = 0): string =>
  n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
