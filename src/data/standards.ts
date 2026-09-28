// 09 제작 프로세스 / 10 보안·운영 기준 — 약속하는 수치라 여기서만 관리. (응답 시간은 초안)
export const processSteps = [
  { no: '01', name: '상담·요구사항 정의', period: '1~2일', output: '요구사항 정의서' },
  { no: '02', name: '화면 설계', period: '2~3일', output: '화면 설계서' },
  { no: '03', name: '시안 제작', period: '7일', output: '시안 링크' },
  { no: '04', name: '테스트', period: '2일', output: '테스트 리포트' },
  { no: '05', name: '오픈·인수인계', period: '1일', output: '운영 매뉴얼' },
  { no: '06', name: '오픈 30일 성과 리포트', period: '30일', output: '전후 비교 리포트' },
];

export const security = [
  { title: '전송 암호화(HTTPS)', desc: '모든 페이지·관리화면·API 통신 암호화' },
  { title: '관리자 2단계 인증', desc: '비밀번호 + 인증 코드로만 관리화면 접속' },
  { title: '담당자별 열람 권한 분리', desc: '담당자는 자기에게 배정된 고객만 조회' },
  { title: '일 1회 백업', desc: '고객 데이터 매일 자동 백업' },
  { title: '개인정보 처리위탁 계약', desc: '고객사 DB를 다루기 전 위탁 계약서 별도 체결' },
];

export const operations = [
  { title: '장애 1차 응답 4시간', desc: '영업일 기준, 접수 후 4시간 안에 원인·조치 계획 회신' },
  { title: '문구 수정 2영업일', desc: '월 운영비에 월 1회 소규모 문구·이미지 수정 포함' },
  { title: '기능 추가는 견적 후 일정 확정', desc: '범위·비용·일정을 문서로 먼저 합의' },
  { title: '오픈 30일 성과 리포트', desc: '문의 수, 응답 시간, 누락 건수 전후 비교 — 모든 상품 기본 포함' },
];
