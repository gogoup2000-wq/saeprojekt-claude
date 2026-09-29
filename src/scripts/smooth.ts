// Lenis 부드러운 스크롤 + GSAP ScrollTrigger 동기화 — 사이트 전체에서 이 파일 하나만 쓴다.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { canSmoothScroll } from './motion';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis | null {
  if (lenis || !canSmoothScroll()) return lenis; // 모바일·모션 줄이기면 기본 스크롤 유지

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

  // Lenis가 움직일 때마다 ScrollTrigger 위치 갱신
  lenis.on('scroll', ScrollTrigger.update);

  // GSAP 한 개의 시계(ticker)로 Lenis를 돌려서 두 라이브러리 타이밍을 맞춘다
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/** 메뉴 클릭 등에서 섹션으로 이동할 때 사용. Lenis가 꺼져 있으면 기본 스크롤 */
export function scrollToTarget(target: string | HTMLElement): void {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const offset = -parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '64', 10);
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.1 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

export { gsap, ScrollTrigger };
