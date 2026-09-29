# 노브(KNOB) 공식 사이트

"돌리면, 돌아갑니다." — AI 홈페이지·업무 자동화·고객관리 어드민 판매 사이트.
프로젝트 규칙은 [CLAUDE.md](./CLAUDE.md).

## 1. 내 컴퓨터에서 보기

```bash
npm install        # 필요한 라이브러리 설치 (처음 한 번)
npm run dev        # 화면 미리보기 → http://localhost:4321  (진단 제출 API는 안 됨)
npm run preview    # 배포와 같은 환경(Worker + 로컬 D1) → http://localhost:8787  (진단 제출까지 됨)
```

`npm run preview` 전에 한 번: `npx wrangler d1 migrations apply knob-leads --local` (내 컴퓨터용 DB에 표 만들기)

## 2. 오픈 전에 직접 채울 것 (전부 src/data/)

| 파일 | 내용 | 비어 있으면 |
|---|---|---|
| `company.ts` | 상호·대표자·사업자번호·주소·연락처·개인정보 보호책임자 | 푸터에 안 보임 (법적 표시 의무 — 반드시 채울 것) |
| `proof.ts` | 실가동 지표 실측값 3개 + 실제 화면 이미지 목록 | 05 섹션 전체 숨김 |
| `cases.ts` | 사례 결과 수치 (before/after) | 결과 카드 숨김 |
| `products.ts` | 가격·기간·포함 항목 | — |
| `faq.ts` | FAQ 답변 (환불 기준은 초안 — 계약서와 맞출 것) | — |
| `standards.ts` | 제작 단계, 보안·운영 기준 (응답 시간 초안) | — |
| `pipeline.ts` | 작동 원리 노드별 기술명 | — |
| `diagnosis-rules.ts` | 진단 10문항·추천 규칙 | — |
| `industries.ts` | 04 업종별 시나리오 (초안 — 실제 상담 표현으로 다듬기) | — |
| `compare.ts` | 10 비교표 (초안) | — |
| `plan-screens.ts` | 08 플랜별 예시 화면의 숫자·목록 (전부 예시값) | — |
| `promises.ts` | 히어로 아래 약속 띠·마지막 진단 유도 문구 (faq·standards와 맞출 것) | — |
| `../content/story.md` | 만든 사람 스토리 | — |

실제 화면 이미지는 `public/proof/`(실가동 지표), `public/products/`(상품 타일)에 webp로 넣고 위 파일에 경로를 적으면 됩니다. **고객 이름·연락처는 반드시 가린 뒤 넣기.**

## 3. 배포 (Cloudflare Workers)

한 줄씩 실행. 괄호는 그 명령이 하는 일.

```bash
npx wrangler login                                  # (브라우저가 열림 → Cloudflare 계정 로그인 허용)
npx wrangler d1 create knob-leads                   # (진단 저장용 DB 생성 → 출력된 database_id 복사)
#   → wrangler.jsonc 의 "database_id" 값을 복사한 값으로 교체
npx wrangler d1 migrations apply knob-leads --remote # (실제 DB에 leads 표 만들기)
npx wrangler secret put TELEGRAM_BOT_TOKEN          # (봇 토큰 입력 — 코드 밖 금고에 저장)
npx wrangler secret put TELEGRAM_CHAT_ID            # (알림 받을 채팅 ID 입력)
npm run deploy                                      # (사이트 빌드 후 인터넷에 공개 → knob-site.<계정>.workers.dev)
```

### 텔레그램 봇 토큰·채팅 ID 얻는 법
1. 텔레그램에서 `@BotFather` 검색 → `/newbot` → 이름 입력 → **토큰**(`123456:ABC...`) 받음
2. 만든 봇과 대화방을 열고 아무 말이나 한 번 보냄
3. 브라우저에서 `https://api.telegram.org/bot<토큰>/getUpdates` 열기 → `"chat":{"id":123456789` 의 숫자가 **채팅 ID**
   (단체방이면 봇을 방에 초대하고 방에서 한 번 말한 뒤 확인. 음수 ID도 그대로 입력)

### 진단 → 저장 → 알림 테스트
1. 배포 주소에서 14 무료 자동화 진단을 끝까지 제출
2. 텔레그램에 `[노브 진단] 회사명 / 이름 / 연락처 / 추천: …` 메시지가 1분 안에 오는지 확인
3. 저장 확인: `npx wrangler d1 execute knob-leads --remote --command "SELECT diagnosis_no, name, company, recommendation, created_at FROM leads ORDER BY id DESC LIMIT 5"`
4. 알림이 안 오면: `npx wrangler tail` 실행 후 다시 제출 → 로그에 '텔레그램 전송 실패' 원인이 찍힘

도메인 연결은 도메인 구매 후 Cloudflare 대시보드 → Workers → knob-site → 설정 → 도메인에서 추가. (연결 후 `astro.config.mjs`의 `site` 값을 실제 도메인으로 바꾸고 다시 배포)

## 4. 구조

```
src/
  pages/index.astro            메인 (14개 섹션 순서)
  pages/privacy.astro, 404.astro
  layouts/Base.astro           공통 HTML·공유 미리보기·유입경로(UTM) 저장
  components/Header.astro      상단 메뉴 + 우측 스크롤 게이지
  components/sections/         S01~S16 섹션 (04 업종별·10 비교 추가)
  scripts/motion.ts            모션 줄이기·모바일·저사양 감지, 공통 곡선
  scripts/smooth.ts            Lenis + GSAP ScrollTrigger 동기화
  scripts/hero.ts, shader.ts   히어로 노브, 배경 셰이더
  scripts/monday.ts            02 스크롤 서사
  styles/tokens.css            디자인 토큰
  data/                        가격·실측값·사례·진단 규칙 (직접 수정)
worker/index.ts                /api/diagnosis (검증 → D1 저장 → 텔레그램)
migrations/0001_leads.sql      DB 표 구조
wrangler.jsonc                 Cloudflare 설정
public/og.png                  공유 미리보기 이미지 (1200×630)
```

## 5. 진행 단계

- [x] 0단계 CLAUDE.md
- [x] 1단계 뼈대·섹션 배치
- [x] 2단계 히어로 노브
- [x] 3단계 스크롤 서사 + 라이브 샌드박스
- [x] 4단계 전문성 섹션
- [x] 5단계 상품·계산기·진단·저장·알림
- [x] 6단계 점검 (배포는 3번 절차대로 계정 로그인 후 실행)
