// 02 월요일 오전 9시 — 화면 고정(pin) + 스크롤 연동 장면 전환
import { gsap, ScrollTrigger } from './smooth';
import { canAnimate, isMobile } from './motion';

// 장면 시작 시각(타임라인 초). 마지막 값은 타임라인 끝
const AT = [0, 1.4, 2.8, 4.2, 5.6, 7.8];
const CLOCK = ['09:00', '09:01', '09:02', '09:03', '18:00'];

/** 항상 같은 배치가 나오도록 고정 시드 난수 */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function initMonday(): void {
  const root = document.querySelector<HTMLElement>('[data-monday]');
  if (!root || !canAnimate() || isMobile()) return; // 정적 세로 카드 유지

  root.classList.add('is-live');

  const pin = root.querySelector<HTMLElement>('[data-monday-pin]')!;
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const clock = root.querySelector<HTMLElement>('[data-clock]')!;
  const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root);
  const agents = gsap.utils.toArray<HTMLElement>('[data-agent]', root);
  const phone = root.querySelector<HTMLElement>('[data-phone]')!;
  const sms = gsap.utils.toArray<HTMLElement>('[data-sms]', root);
  const settle = root.querySelector<HTMLElement>('[data-settle]')!;
  const counts = gsap.utils.toArray<HTMLElement>('[data-count]', root);
  const captions = gsap.utils.toArray<HTMLElement>('[data-caption]', root);

  const CH = 46;
  const PAD = 20;
  const size = () => ({ W: stage.clientWidth, H: stage.clientHeight });
  const cardW = () => Math.min(132, (size().W - PAD * 4) / 3);

  // 장면별 카드 위치 계산 (화면 크기가 바뀌면 다시 계산됨)
  const scatter = (i: number) => {
    const r = seeded(i * 97 + 13);
    const { W, H } = size();
    return { x: PAD + r() * (W - cardW() - PAD * 2), y: PAD + r() * (H - CH - PAD * 2), rotation: (r() - 0.5) * 40 };
  };
  const order = cards.map((c, i) => ({ i, k: c.dataset.kind! })).sort((a, b) => a.k.localeCompare(b.k));
  const gridPos = (i: number) => {
    const { W } = size();
    const cols = Math.max(3, Math.floor((W - PAD * 2) / (cardW() + 10)));
    const idx = order.findIndex((o) => o.i === i);
    return { x: PAD + (idx % cols) * (cardW() + 10), y: PAD + 20 + Math.floor(idx / cols) * (CH + 10), rotation: 0 };
  };
  const colPos = (i: number) => {
    const { W } = size();
    const colW = (W - PAD * 2) / 3;
    const a = i % 3;
    const row = Math.floor(i / 3);
    return { x: PAD + a * colW, y: 48 + row * (CH + 8), rotation: 0 };
  };

  // 카드 폭·담당자 열 위치 (창 크기가 바뀔 때마다 다시)
  function layout(): void {
    cards.forEach((c) => c.style.setProperty('--cw', `${cardW()}px`));
    gsap.set(agents, { x: (i) => PAD + (i * (size().W - PAD * 2)) / 3 });
  }
  layout();
  ScrollTrigger.addEventListener('refreshInit', layout);
  gsap.set(cards, { x: (i) => scatter(i).x, y: -80, rotation: (i) => scatter(i).rotation, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

  // 09:00 — 카드가 무질서하게 떨어짐
  tl.to(cards, { y: (i) => scatter(i).y, opacity: 1, duration: 1, ease: 'bounce.out', stagger: { each: 0.025, from: 'random' } }, AT[0]);

  // 09:01 — 업종 태그를 달고 정렬
  tl.to(cards, { x: (i) => gridPos(i).x, y: (i) => gridPos(i).y, rotation: 0, duration: 1, stagger: 0.015 }, AT[1]);

  // 09:02 — 담당자 3명 열로
  tl.to(agents, { opacity: 1, duration: 0.3 }, AT[2]);
  tl.to(cards, { x: (i) => colPos(i).x, y: (i) => colPos(i).y, duration: 1, stagger: 0.02 }, AT[2]);

  // 09:03 — 휴대폰에 안내 문자 도착
  tl.to(cards, { opacity: 0.3, duration: 0.4 }, AT[3]);
  tl.to(phone, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }, AT[3]);
  tl.to(sms, { opacity: 1, y: 0, duration: 0.3, stagger: 0.25, startAt: { y: 10 } }, AT[3] + 0.35);

  // 18:00 — 카드가 합쳐져 정산 표 한 장
  tl.to(phone, { opacity: 0, x: 40, duration: 0.4 }, AT[4]);
  tl.to(agents, { opacity: 0, duration: 0.3 }, AT[4]);
  tl.to(
    cards,
    { x: () => size().W / 2 - cardW() / 2, y: () => size().H / 2 - CH / 2, opacity: 0, scale: 0.6, duration: 0.7, stagger: 0.01 },
    AT[4],
  );
  tl.to(settle, { opacity: 1, yPercent: 4, duration: 0.5, ease: 'power3.out' }, AT[4] + 0.6);
  const countState = { p: 0 };
  tl.to(
    countState,
    {
      p: 1,
      duration: 0.8,
      ease: 'power1.out',
      onUpdate: () => counts.forEach((el) => (el.textContent = String(Math.round(Number(el.dataset.count) * countState.p)))),
    },
    AT[4] + 0.8,
  );
  tl.to({}, { duration: Math.max(0.1, AT[5] - tl.duration()) }); // 끝에 여유

  // 스크롤 진행 → 시계·설명 갱신
  let current = -1;
  function sync(): void {
    const t = tl.time();
    let s = 0;
    for (let i = 0; i < 5; i++) if (t >= AT[i] - 0.15) s = i;
    stage.classList.toggle('tagged', t >= AT[1] + 0.3);
    if (s !== current) {
      current = s;
      captions.forEach((c, i) => c.classList.toggle('is-on', i === s));
    }
    // 09:03 → 18:00 구간은 시간이 빠르게 흐름
    const ffFrom = AT[4] - 0.3;
    const ffTo = AT[4] + 0.6;
    if (t > ffFrom && t < ffTo) {
      const p = (t - ffFrom) / (ffTo - ffFrom);
      const mins = 9 * 60 + 3 + Math.round(p * (9 * 60 - 3));
      clock.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
    } else {
      clock.textContent = CLOCK[s];
    }
  }

  ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: () => `+=${window.innerHeight * 4}`,
    pin: true,
    scrub: 0.6,
    animation: tl,
    invalidateOnRefresh: true,
  });
  // 스크럽이 따라오는 동안에도 시계·설명이 맞도록 타임라인 기준으로 갱신
  tl.eventCallback('onUpdate', sync);
  sync();
}
