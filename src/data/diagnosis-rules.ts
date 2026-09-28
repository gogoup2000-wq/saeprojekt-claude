// 14 무료 자동화 진단 — 문항과 추천 규칙. 화면(브라우저)과 서버(Worker)가 같은 파일을 쓴다.
import { productById, type ProductId } from './products';

export interface Option {
  v: string;
  label: string;
}
export interface Question {
  id: string;
  q: string;
  multi?: boolean;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 'industry',
    q: '어떤 업종이세요?',
    options: [
      { v: 'consult', label: '컨설팅·대행' },
      { v: 'sales', label: '보험·대출 영업' },
      { v: 'edu', label: '교육·학원' },
      { v: 'clinic', label: '병의원' },
      { v: 'interior', label: '인테리어·시공' },
      { v: 'beauty', label: '뷰티·매장' },
      { v: 'franchise', label: '프랜차이즈 본사' },
      { v: 'etc', label: '기타' },
    ],
  },
  {
    id: 'staff',
    q: '직원은 몇 명인가요?',
    options: [
      { v: '1-2', label: '1~2명' },
      { v: '3-5', label: '3~5명' },
      { v: '6-15', label: '6~15명' },
      { v: '16+', label: '16명 이상' },
    ],
  },
  {
    id: 'leads',
    q: '한 달에 문의가 몇 건 들어오나요?',
    options: [
      { v: '<30', label: '30건 미만' },
      { v: '30-100', label: '30~100건' },
      { v: '100-300', label: '100~300건' },
      { v: '300+', label: '300건 이상' },
    ],
  },
  {
    id: 'sources',
    q: '문의는 어디로 들어오나요? (여러 개 선택)',
    multi: true,
    options: [
      { v: 'meta', label: '메타(페북·인스타) 광고' },
      { v: 'naver', label: '네이버 광고·플레이스' },
      { v: 'web', label: '홈페이지' },
      { v: 'phone', label: '전화' },
      { v: 'kakao', label: '카카오톡 채널' },
      { v: 'referral', label: '소개·지인' },
    ],
  },
  {
    id: 'manage',
    q: '지금 고객 정보는 어떻게 정리하세요?',
    options: [
      { v: 'none', label: '따로 안 함 (기억·문자함)' },
      { v: 'sheet', label: '엑셀·구글시트' },
      { v: 'kakao', label: '카톡방에 공유' },
      { v: 'crm', label: 'CRM 프로그램 사용 중' },
    ],
  },
  {
    id: 'assign',
    q: '담당자 배분은 어떻게 하세요?',
    options: [
      { v: 'solo', label: '대표 혼자 응대' },
      { v: 'owner', label: '대표가 직접 나눠줌' },
      { v: 'first', label: '먼저 본 사람이 가져감' },
      { v: 'rule', label: '정해진 규칙이 있음' },
    ],
  },
  {
    id: 'pain',
    q: '가장 시간을 뺏는 일은 뭔가요?',
    options: [
      { v: 'copy', label: '문의 옮겨 적기' },
      { v: 'assign', label: '담당자 배정·전달' },
      { v: 'contact', label: '고객 연락·안내 문자' },
      { v: 'settle', label: '월말 정산·실적 집계' },
      { v: 'content', label: '홈페이지·광고 문구 수정' },
    ],
  },
  {
    id: 'homepage',
    q: '홈페이지가 있나요?',
    options: [
      { v: 'none', label: '없음' },
      { v: 'old', label: '있지만 오래됨·문의 기능 없음' },
      { v: 'ok', label: '있고 문의폼도 있음' },
    ],
  },
  {
    id: 'budget',
    q: '생각하시는 예산은요?',
    options: [
      { v: '<100', label: '100만 원 미만' },
      { v: '100-300', label: '100~300만 원' },
      { v: '300-700', label: '300~700만 원' },
      { v: '700+', label: '700만 원 이상' },
      { v: 'tbd', label: '상담 후 결정' },
    ],
  },
  {
    id: 'start',
    q: '언제 시작하고 싶으세요?',
    options: [
      { v: 'now', label: '바로 (2주 안)' },
      { v: '1m', label: '1개월 안' },
      { v: '3m', label: '3개월 안' },
      { v: 'explore', label: '알아보는 중' },
    ],
  },
];

export type Answers = Record<string, string | string[]>;

/** 응답이 문항·선택지와 맞는지 검사 (서버 검증용) */
export function validAnswers(a: unknown): a is Answers {
  if (!a || typeof a !== 'object') return false;
  const obj = a as Record<string, unknown>;
  return questions.every((q) => {
    const v = obj[q.id];
    const ok = (x: unknown) => typeof x === 'string' && q.options.some((o) => o.v === x);
    return q.multi ? Array.isArray(v) && v.length > 0 && v.length <= q.options.length && v.every(ok) : ok(v);
  });
}

export const labelOf = (qid: string, v: string | string[]): string => {
  const q = questions.find((x) => x.id === qid);
  const one = (x: string) => q?.options.find((o) => o.v === x)?.label ?? x;
  return Array.isArray(v) ? v.map(one).join(', ') : one(v);
};

export interface Recommendation {
  primary: ProductId;
  next: ProductId | null; // 예산 때문에 단계적으로 갈 때 2단계
  reasons: string[];
  summary: string[];
  estimate: { min: number; max: number; monthly: number; period: string }; // 만 원
}

const BUDGET_CAP: Record<string, number> = { '<100': 100, '100-300': 300, '300-700': 700, '700+': Infinity, tbd: Infinity };
const idx = (qid: string, v: string) => questions.find((q) => q.id === qid)!.options.findIndex((o) => o.v === v);

export function recommend(a: Answers): Recommendation {
  const s = (k: string) => String(a[k] ?? '');
  const sources = (Array.isArray(a.sources) ? a.sources : []) as string[];
  const reasons: string[] = [];

  const hp = s('homepage');
  const needWeb = hp === 'none' || hp === 'old';
  if (hp === 'none') reasons.push('문의를 받을 창구(홈페이지)가 없어 광고·검색 유입이 전화·카톡으로 흩어집니다.');
  if (hp === 'old') reasons.push('홈페이지에 문의 기능이 없어 방문자가 그냥 나갑니다.');

  const adSource = sources.some((x) => x === 'meta' || x === 'naver' || x === 'web');
  const manualManage = ['none', 'sheet', 'kakao'].includes(s('manage'));
  const needAuto = (adSource && manualManage) || s('pain') === 'copy' || s('pain') === 'contact';
  if (needAuto) reasons.push('광고·홈페이지 문의를 사람이 옮겨 적고 있습니다. 시트 적재·알림·안내 문자를 자동으로 잇는 게 먼저입니다.');

  const team = idx('staff', s('staff')) >= 1; // 3명 이상
  const manualAssign = ['owner', 'first'].includes(s('assign'));
  const volume = idx('leads', s('leads')) >= 2; // 월 100건 이상
  const needDesk = team && (manualAssign || s('pain') === 'assign' || s('pain') === 'settle' || volume);
  if (needDesk) {
    if (manualAssign) reasons.push('담당자 배분을 사람이 하고 있어 배정이 늦고, 누가 어떤 고객을 맡았는지 흐려집니다.');
    if (s('pain') === 'settle') reasons.push('월말 정산을 매번 다시 계산하고 있습니다. 상태값 기준 자동 집계로 바꿀 수 있습니다.');
    if (volume) reasons.push('월 100건 이상이면 시트만으로는 누락이 생기기 시작합니다. 관리화면이 필요한 규모입니다.');
  }

  let primary: ProductId;
  if (needDesk && needWeb) primary = 'full';
  else if (needDesk) primary = 'desk';
  else if (needWeb && needAuto) primary = hp === 'none' && idx('leads', s('leads')) === 0 ? 'web-lite' : 'web-pro';
  else if (needAuto) primary = 'auto';
  else if (needWeb) primary = hp === 'none' ? 'web-lite' : 'web-pro';
  else primary = 'auto';

  if (reasons.length === 0) reasons.push('기본 구조는 갖춰져 있습니다. 문의 알림·안내 문자 자동화로 응답 속도부터 줄이는 구성이 맞습니다.');

  // 예산 안에서 1단계 → 2단계로 나누기
  let next: ProductId | null = null;
  const cap = BUDGET_CAP[s('budget')] ?? Infinity;
  const ladder: ProductId[] = ['web-lite', 'auto', 'web-pro', 'desk', 'full'];
  if (productById(primary).build > cap) {
    next = primary;
    const fits = ladder.filter((id) => productById(id).build <= cap);
    primary = fits.length ? fits[fits.length - 1] : 'web-lite';
    if (primary === next) next = null;
  }

  const p = productById(primary);
  const summary = [
    `${labelOf('industry', s('industry'))} · 직원 ${labelOf('staff', s('staff'))} · 월 문의 ${labelOf('leads', s('leads'))}`,
    `문의 경로: ${labelOf('sources', sources)}`,
    `고객 정리: ${labelOf('manage', s('manage'))} / 배분: ${labelOf('assign', s('assign'))}`,
    `가장 시간을 뺏는 일: ${labelOf('pain', s('pain'))}`,
    `홈페이지: ${labelOf('homepage', hp)}`,
  ];

  return {
    primary,
    next,
    reasons: reasons.slice(0, 4),
    summary,
    estimate: { min: p.build, max: p.buildMax, monthly: p.monthly, period: p.period },
  };
}
