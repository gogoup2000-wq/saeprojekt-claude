// 07 구축 사례 — 문제 → 설계 → 구축 → 결과. 결과 수치는 실측값만.
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
    problem: '광고 문의가 엑셀과 카톡방에 흩어져 있었습니다. 담당자 배정은 늦고, 월말 정산은 매번 처음부터 다시 계산했습니다.',
    design: '문의가 들어오는 순간부터 담당자 휴대폰까지를 한 줄로 이었습니다. 입력폼 → 시트 → 관리화면 → 담당자 알림. 정산은 고객 상태값(상담중·계약)만 바꾸면 자동으로 집계되게 했습니다.',
    build: '관리화면, 담당자 실시간 알림, 계약 건을 광고로 되돌려 보내는 성과 전송, 외부 정보 하루 4회 자동 수집, 입금 확인 시 자료 자동 발송까지 만들어 매일 쓰고 있습니다.',
    stack: ['Cloudflare Workers', 'Google Sheets', 'Telegram Bot API', 'Meta Conversions API'],
    results: [
      { label: '문의 알림 도착', before: null, after: null },
      { label: '누락 문의 (월)', before: null, after: null },
      { label: '월말 정산 작업', before: null, after: null },
    ],
  },
];
