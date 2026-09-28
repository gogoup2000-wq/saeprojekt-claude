// 06 구축 사례 — 문제 → 설계 → 구축 → 결과. 결과 수치는 실측값만.
// before/after 중 하나라도 null이면 그 결과 줄은 화면에 안 나온다.
export interface CaseResult {
  label: string;
  before: string | null;
  after: string | null;
}
export interface Case {
  id: string;
  tab: string;
  client: string;
  problem: string;
  design: string;
  build: string;
  stack: string[];
  results: CaseResult[];
}

export const cases: Case[] = [
  {
    id: 'self',
    tab: '자사 · 상담 조직',
    client: '노브 운영사 (정책자금 상담 조직)',
    problem: '광고 문의가 엑셀·카톡으로 흩어짐. 담당자 배정이 늦고, 월말 정산을 매번 처음부터 다시 계산.',
    design: '입력폼 → 시트 → 관리화면 → 담당자 알림을 한 줄로 연결. 정산은 상태값 기준 자동 집계.',
    build: 'Cloudflare Workers 기반 관리화면, 텔레그램 실시간 알림, 광고 성과 자동 전송, 외부 데이터 하루 4회 자동 수집, 입금 확인 → 자료 자동 발송.',
    stack: ['Cloudflare Workers', 'Google Sheets', 'Telegram Bot API', 'Meta Conversions API'],
    results: [
      { label: '문의 알림 도착', before: null, after: null },
      { label: '누락 문의 (월)', before: null, after: null },
      { label: '월말 정산 작업', before: null, after: null },
    ],
  },
];
