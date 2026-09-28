# 노브(KNOB) 공식 사이트

"돌리면, 돌아갑니다." — AI 홈페이지·업무 자동화·고객관리 어드민 판매 사이트.
프로젝트 규칙은 [CLAUDE.md](./CLAUDE.md)에 있음.

## 실행

```bash
npm install        # 필요한 라이브러리 설치 (처음 한 번)
npm run dev        # 내 컴퓨터에서 미리보기 → http://localhost:4321
npm run build      # 배포용 파일을 dist/ 폴더에 생성
npm run preview    # Cloudflare와 같은 환경으로 로컬 실행
npm run deploy     # Cloudflare Workers에 배포 (로그인 필요)
```

## 구조

```
src/
  pages/index.astro          메인 페이지 (14개 섹션 순서 배치)
  layouts/Base.astro         공통 HTML 틀, 부드러운 스크롤 시작
  components/Header.astro    상단 메뉴 + 우측 스크롤 게이지
  components/sections/       S01~S14 섹션 파일
  styles/tokens.css          디자인 토큰 (색·글꼴·모션 값)
  styles/global.css          배경 격자·노이즈, .reveal 등장 효과
  scripts/motion.ts          모션 줄이기·모바일·저사양 감지
  scripts/smooth.ts          Lenis + GSAP ScrollTrigger 동기화
  data/                      가격·실측값·사례·진단 규칙 (직접 수정)
wrangler.jsonc               Cloudflare Workers 배포 설정
```

## 진행 단계

- [x] 0단계 CLAUDE.md
- [x] 1단계 뼈대·섹션 배치
- [ ] 2단계 히어로 노브
- [ ] 3단계 스크롤 서사 + 라이브 샌드박스
- [ ] 4단계 전문성 섹션
- [ ] 5단계 상품·계산기·진단·저장·알림
- [ ] 6단계 점검·배포
