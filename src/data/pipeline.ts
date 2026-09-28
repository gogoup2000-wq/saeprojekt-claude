// 05 작동 원리 — 실제로 쓰는 기술만 적는다. 바뀌면 여기만 수정.
export interface PipelineNode {
  step: string; // 쉬운 말
  tech: string; // 실제 기술명
  does: string; // 이 단계에서 하는 일 (툴팁)
}

export const pipeline: PipelineNode[] = [
  { step: '광고', tech: 'Meta 리드 광고', does: '광고를 본 고객이 문의 버튼을 누릅니다.' },
  { step: '입력폼', tech: 'Cloudflare Workers', does: '이름·연락처·문의 내용을 받고, 빈칸·중복·봇을 걸러냅니다.' },
  { step: '데이터베이스', tech: 'Cloudflare D1', does: '문의 한 건이 한 줄로 저장됩니다. 엑셀에 옮겨 적을 일이 없어집니다.' },
  { step: '관리화면', tech: 'Cloudflare Workers', does: '담당자 자동 배정(라운드로빈), 상태값 변경, 월말 정산 집계를 한 화면에서.' },
  { step: '담당자 알림', tech: 'Telegram Bot API', does: '배정된 담당자 휴대폰으로 문의 내용이 바로 갑니다.' },
  { step: '광고 성과 전송', tech: 'Meta Conversions API', does: '상담·계약으로 이어진 건을 광고에 되돌려 보내, 광고가 비슷한 고객을 더 찾게 합니다(전환 API).' },
];
