// 08 상품 — 플랜별 '실제 화면' 예시 데이터. 전부 예시값(실측 아님)이라 화면에 '예시 화면' 라벨이 붙는다.
// 실제 고객사 화면 캡처가 생기면 products.ts의 media에 경로를 넣으면 이 예시 대신 캡처가 나온다.
// 이름은 반드시 가린 형태(김OO)로, 연락처는 뒷자리만.

export type Status = '신규' | '배정' | '상담중' | '계약' | '보류';

export interface LeadRow {
  time: string;
  name: string;
  phone: string;
  topic: string;
  source: string;
  staff: string;
  status: Status;
}

// 데스크 · 풀 공통 리드 목록
export const leads: LeadRow[] = [
  { time: '09:42', name: '김OO', phone: '···-1284', topic: '정책자금', source: '메타', staff: '이선임', status: '신규' },
  { time: '09:31', name: '박OO', phone: '···-5520', topic: '운전자금', source: '네이버', staff: '김주임', status: '배정' },
  { time: '09:18', name: '최OO', phone: '···-0937', topic: '시설자금', source: '메타', staff: '박대리', status: '상담중' },
  { time: '08:55', name: '정OO', phone: '···-7710', topic: '정책자금', source: '홈페이지', staff: '이선임', status: '계약' },
  { time: '08:40', name: '한OO', phone: '···-3368', topic: '운전자금', source: '메타', staff: '김주임', status: '상담중' },
  { time: '어제', name: '윤OO', phone: '···-2051', topic: '시설자금', source: '소개', staff: '박대리', status: '보류' },
];

// 데스크 칸반 보드 (예시) — 칸 이름은 상태값
export const board: { col: Status; cards: { name: string; topic: string; staff: string; time: string }[] }[] = [
  { col: '신규', cards: [
    { name: '김OO', topic: '정책자금', staff: '이', time: '09:42' },
    { name: '서OO', topic: '운전자금', staff: '김', time: '09:40' },
  ] },
  { col: '배정', cards: [
    { name: '박OO', topic: '운전자금', staff: '김', time: '09:31' },
    { name: '오OO', topic: '시설자금', staff: '박', time: '09:12' },
    { name: '임OO', topic: '정책자금', staff: '이', time: '08:58' },
  ] },
  { col: '상담중', cards: [
    { name: '한OO', topic: '운전자금', staff: '김', time: '08:40' },
    { name: '최OO', topic: '시설자금', staff: '박', time: '09:18' }, // 계약 칸으로 옮기는 중인 카드
  ] },
  { col: '계약', cards: [
    { name: '정OO', topic: '정책자금', staff: '이', time: '08:55' },
  ] },
];

// 플랜마다 켜지는 기능 — products.ts의 includes와 맞춰 둘 것
export const capabilities = ['홈페이지', '휴대폰 알림', 'AI 진단·문구 관리', '시트·문자 자동 연결', '담당자 배정·관리', '정산 자동 집계', '광고 성과 전송'];
export const planCaps: Record<string, number[]> = {
  'web-lite': [0, 1],
  'web-pro': [0, 1, 2],
  auto: [1, 3, 6],
  desk: [4, 5],
  full: [0, 1, 2, 3, 4, 5, 6],
};

// 데스크 상단 계기 (예시)
export const deskKpis = [
  { label: '오늘 신규', value: '23', unit: '건' },
  { label: '미배정', value: '0', unit: '건', ok: true },
  { label: '첫 연락까지', value: '11', unit: '분' },
  { label: '이번 달 계약', value: '41', unit: '건' },
];

// 담당자별 오늘 처리 (예시)
export const staffLoad = [
  { name: '이선임', done: 8, total: 8 },
  { name: '김주임', done: 6, total: 8 },
  { name: '박대리', done: 5, total: 7 },
];

// 오토 — 광고폼 → 시트 → 알림 → 문자 → 전환 전송 (오늘 처리 건수, 예시)
export const autoPipe = [
  { step: '광고폼', count: 31 },
  { step: '구글시트 적재', count: 31 },
  { step: '담당자 알림', count: 31 },
  { step: '안내 문자', count: 31 },
  { step: '전환 전송', count: 9 },
];

// 풀 — 월간 운영 리포트 (예시)
export const fullFunnel = [
  { channel: '메타 광고', lead: 412, consult: 268, contract: 71 },
  { channel: '네이버', lead: 186, consult: 131, contract: 38 },
  { channel: '홈페이지', lead: 97, consult: 74, contract: 22 },
  { channel: '소개', lead: 41, consult: 37, contract: 17 },
];
export const fullWeeks = [58, 71, 66, 84, 79, 93, 88, 102]; // 주별 문의 수 (최근 8주)
export const settlement = [
  { staff: '이선임', contract: 52, amount: '1,560만' },
  { staff: '김주임', contract: 49, amount: '1,470만' },
  { staff: '박대리', contract: 47, amount: '1,410만' },
];
