// 05 실가동 지표 — 반드시 실측값만. 값이 null이면 그 계기판은 화면에 안 나온다.
// 계기판·화면이 하나도 없으면 05 섹션 전체가 숨겨진다.
export interface Gauge {
  label: string;
  value: number | null; // 실측값. 모르면 null
  unit: string;
  max: number; // 계기판 바늘 최대값
  digits?: number; // 소수점 자리
  note?: string; // 측정 기준 (예: '2026.03~ 기준')
}

export const gauges: Gauge[] = [
  { label: '가동 기간', value: null, unit: '개월', max: 24, note: '자사 시스템 가동 시작일 기준' },
  { label: '누적 처리 문의', value: null, unit: '건', max: 5000, note: '관리화면 누적 건수' },
  { label: '평균 알림 도착', value: null, unit: '초', max: 60, digits: 1, note: '문의 접수 → 담당자 휴대폰' },
];

// public/proof/ 폴더에 넣은 실제 화면(개인정보 마스킹 필수). 없으면 빈 배열.
export interface Screen {
  src: string; // 예: '/proof/admin-list.webp'
  alt: string;
  caption: string;
}
export const screens: Screen[] = [];
