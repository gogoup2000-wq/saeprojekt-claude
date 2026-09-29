// 상품·가격 — 가격은 이 파일에서만 바꾼다. 단위: 만 원, VAT 별도.
export type ProductId = 'web-lite' | 'web-pro' | 'auto' | 'desk' | 'full';

export interface Product {
  id: ProductId;
  name: string;
  line: string; // 한 줄 설명
  fit: string; // 이런 회사에 맞습니다 (초안)
  build: number; // 제작비 (만 원)
  buildFrom: boolean; // true면 '~' (범위 견적)
  buildMax: number; // 진단 견적 범위 상한 (만 원)
  monthly: number; // 월 운영비 (만 원)
  period: string; // 제작 기간
  includes: string[];
  media: string[]; // public/products/ 실제 화면 이미지. 비어 있으면 도식 미리보기
}

export const products: Product[] = [
  {
    id: 'web-lite',
    name: '노브 웹 라이트',
    line: '문의가 바로 휴대폰으로 오는 1페이지 홈페이지',
    fit: '홈페이지가 없는 1~2인 매장·사무실. 광고를 켜도 받을 창구가 없을 때.',
    build: 99,
    buildFrom: false,
    buildMax: 99,
    monthly: 3.3,
    period: '7일',
    includes: ['1페이지 랜딩', '상담 신청폼', '텔레그램 문의 알림', '모바일 대응', '서버·도메인 유지'],
    media: [],
  },
  {
    id: 'web-pro',
    name: '노브 웹 프로',
    line: '방문자가 직접 진단하고 상담을 신청하는 홈페이지',
    fit: '문의는 오는데 상담으로 안 이어질 때. 방문자가 스스로 조건을 고르고 신청하게 만들고 싶을 때.',
    build: 250,
    buildFrom: false,
    buildMax: 250,
    monthly: 5.5,
    period: '14~21일',
    includes: ['5~7페이지', 'AI 상담 진단', '문구 수정 관리자', '상담 신청폼 + 텔레그램 알림', '서버·도메인 유지'],
    media: [],
  },
  {
    id: 'auto',
    name: '노브 오토',
    line: '광고 문의가 시트·알림·문자까지 알아서 이어지는 연결',
    fit: '이미 광고·홈페이지가 있고, 문의를 사람이 옮겨 적고 전달하는 데 시간을 쓰고 있을 때.',
    build: 150,
    buildFrom: true,
    buildMax: 250,
    monthly: 5.5,
    period: '7~14일',
    includes: ['광고폼 → 구글시트 자동 적재', '담당자 텔레그램 알림', '고객 접수 안내 자동 문자', '광고 성과 전송(전환 API)'],
    media: [],
  },
  {
    id: 'desk',
    name: '노브 데스크',
    line: '문의 관리·담당자 배정·정산을 한 화면에서',
    fit: '담당자 3명 이상. 누가 어떤 고객을 맡았는지, 월말 실적이 몇 건인지 바로 안 보일 때.',
    build: 390,
    buildFrom: true,
    buildMax: 550,
    monthly: 9.9,
    period: '21~30일',
    includes: ['리드 관리 화면', '담당자 자동 배정(라운드로빈)', '상태값 관리', '월말 정산 자동 집계', '관리자 2단계 인증·권한 분리'],
    media: [],
  },
  {
    id: 'full',
    name: '노브 풀',
    line: '홈페이지부터 정산까지 한 번에 — 웹 프로 + 오토 + 데스크',
    fit: '광고 예산이 크고 상담 조직이 있는 회사. 문의 창구부터 정산까지 한 번에 바꾸고 싶을 때.',
    build: 690,
    buildFrom: true,
    buildMax: 950,
    monthly: 14.9,
    period: '30~45일',
    includes: ['노브 웹 프로 전체', '노브 오토 전체', '노브 데스크 전체', '기존 광고·시트 데이터 이전'],
    media: [],
  },
];

export const productById = (id: ProductId): Product => products.find((p) => p.id === id)!;

/** 99 → '99만 원', 3.3 → '3.3만 원' */
export const won = (manwon: number): string => `${manwon.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만 원`;
export const buildLabel = (p: Product): string => `${won(p.build)}${p.buildFrom ? '~' : ''}`;

/** 모든 상품 공통 */
export const commonBadge = '오픈 30일 성과 리포트 포함';
export const vatNote = 'VAT 별도';
