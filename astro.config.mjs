// @ts-check
import { defineConfig } from 'astro/config';

// 1단계는 정적 사이트로 빌드 → dist/ 를 Cloudflare Workers 정적 자산으로 배포.
// 진단 저장 API(D1·텔레그램)는 5단계에서 Worker 스크립트로 추가한다.
export default defineConfig({
  site: 'https://knob.kr',
  output: 'static',
  build: { inlineStylesheets: 'auto', format: 'file' },
  devToolbar: { enabled: false },
});
