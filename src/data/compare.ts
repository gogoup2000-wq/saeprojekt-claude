// 10 비교표 — '사람 한 명 더 채용' / '홈페이지만 제작' / '노브'. 초안이므로 직접 확인 후 수정.
// 특정 업체를 가리키지 않는 일반적인 비교만 쓴다. 숫자는 넣지 않는다.
export type Mark = 'yes' | 'part' | 'no';

export interface CompareRow {
  label: string;
  hire: [Mark, string];
  site: [Mark, string];
  knob: [Mark, string];
}

export const compareCols = {
  hire: '사람 한 명 더 채용',
  site: '홈페이지만 제작',
  knob: '노브',
};

export const compareRows: CompareRow[] = [
  {
    label: '밤·주말에 들어온 문의',
    hire: ['no', '출근 후에 확인'],
    site: ['part', '게시판·메일에 쌓임'],
    knob: ['yes', '접수 즉시 담당자 휴대폰으로'],
  },
  {
    label: '담당자 배정',
    hire: ['part', '사람이 나눠 줌'],
    site: ['no', '범위 밖'],
    knob: ['yes', '정한 규칙대로 자동 배정'],
  },
  {
    label: '고객 접수 안내',
    hire: ['part', '바쁘면 늦어짐'],
    site: ['no', '범위 밖'],
    knob: ['yes', '자동 문자 발송'],
  },
  {
    label: '월말 정산·실적 집계',
    hire: ['part', '엑셀로 다시 계산'],
    site: ['no', '범위 밖'],
    knob: ['yes', '상태값 기준 자동 집계'],
  },
  {
    label: '광고 성과 연결',
    hire: ['no', '감으로 판단'],
    site: ['part', '방문 수까지만'],
    knob: ['yes', '계약 건을 광고로 되돌려 보냄'],
  },
  {
    label: '퇴사·휴가 때',
    hire: ['no', '인수인계가 끊김'],
    site: ['part', '사이트는 그대로'],
    knob: ['yes', '기록이 시스템에 남음'],
  },
  {
    label: '오픈 후 효과 확인',
    hire: ['no', '따로 없음'],
    site: ['no', '납품으로 끝'],
    knob: ['yes', '오픈 30일 성과 리포트'],
  },
];
