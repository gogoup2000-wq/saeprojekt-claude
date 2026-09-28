// Cloudflare Worker — /api/* 만 처리하고 나머지는 정적 사이트(dist/)를 그대로 보낸다.
import { questions, validAnswers, recommend, labelOf, type Answers } from '../src/data/diagnosis-rules';
import { productById } from '../src/data/products';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  TELEGRAM_BOT_TOKEN?: string; // wrangler secret put TELEGRAM_BOT_TOKEN
  TELEGRAM_CHAT_ID?: string; // wrangler secret put TELEGRAM_CHAT_ID
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);

/** 문자열 키·값만, 개수·길이 제한 */
function smallRecord(v: unknown, maxKeys = 12): Record<string, string | number | null> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  const out: Record<string, string | number | null> = {};
  for (const [k, val] of Object.entries(v).slice(0, maxKeys)) {
    if (typeof val === 'number' && Number.isFinite(val)) out[clean(k, 32)] = val;
    else if (typeof val === 'string') out[clean(k, 32)] = clean(val, 200);
    else if (val === null) out[clean(k, 32)] = null;
  }
  return Object.keys(out).length ? out : null;
}

/** 한국 날짜 YYYYMMDD */
function kstDate(): string {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatPhone(p: string): string {
  return p.length === 11 ? `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}` : p.length === 10 ? `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}` : p;
}

async function notifyTelegram(env: Env, text: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn('텔레그램 비밀값이 없어 알림을 건너뜀');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });
  if (!res.ok) console.error('텔레그램 전송 실패', res.status, await res.text());
}

async function handleDiagnosis(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (req.method !== 'POST') return json({ ok: false, error: '허용되지 않은 요청입니다.' }, 405);
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ ok: false, error: '잘못된 요청입니다.' }, 415);
  const raw = await req.text();
  if (raw.length > 8000) return json({ ok: false, error: '요청이 너무 큽니다.' }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: '잘못된 요청입니다.' }, 400);
  }

  // 봇 방지: 숨은 칸이 채워져 있으면 저장하지 않고 성공처럼 응답
  if (clean(body.website, 100)) return json({ ok: true, diagnosisNo: 'KNOB-00000000-000', recommendation: recommend(fallbackAnswers()) });

  const name = clean(body.name, 20);
  const phone = clean(body.phone, 16).replace(/\D/g, '');
  const company = clean(body.company, 40);
  if (!name || !company) return json({ ok: false, error: '이름과 회사명을 입력해 주세요.' }, 400);
  if (!/^0\d{8,10}$/.test(phone)) return json({ ok: false, error: '연락처를 다시 확인해 주세요.' }, 400);
  if (body.consent !== true) return json({ ok: false, error: '개인정보 수집·이용 동의가 필요합니다.' }, 400);
  if (!validAnswers(body.answers)) return json({ ok: false, error: '진단 응답이 올바르지 않습니다. 처음부터 다시 진행해 주세요.' }, 400);
  const answers = body.answers as Answers;

  // 같은 연락처 1분 안 중복 제출 차단
  const dup = await env.DB.prepare("SELECT 1 FROM leads WHERE phone = ? AND created_at > datetime('now', '-60 seconds') LIMIT 1")
    .bind(phone)
    .first();
  if (dup) return json({ ok: false, error: '방금 접수된 연락처입니다. 1분 뒤에 다시 시도해 주세요.' }, 429);

  const rec = recommend(answers);
  const utm = smallRecord(body.utm);
  const calc = smallRecord(body.calc, 16);

  // 진단번호: KNOB-날짜-일련번호 (충돌 시 한 번 더)
  const day = kstDate();
  let diagnosisNo = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM leads WHERE diagnosis_no LIKE ?').bind(`KNOB-${day}-%`).first<{ n: number }>();
    diagnosisNo = `KNOB-${day}-${String((row?.n ?? 0) + 1 + attempt).padStart(3, '0')}`;
    try {
      await env.DB.prepare(
        'INSERT INTO leads (diagnosis_no, name, phone, company, answers_json, recommendation, utm_json, calc_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(diagnosisNo, name, phone, company, JSON.stringify(answers), rec.primary, utm ? JSON.stringify(utm) : null, calc ? JSON.stringify(calc) : null)
        .run();
      break;
    } catch (e) {
      if (attempt === 2 || !String(e).includes('UNIQUE')) {
        console.error('D1 저장 실패', e);
        return json({ ok: false, error: '저장 중 문제가 생겼습니다.' }, 500);
      }
    }
  }

  const productName = (id: typeof rec.primary) => productById(id).name.replace('노브 ', '');
  const lines = [
    `[노브 진단] ${company} / ${name} / ${formatPhone(phone)} / 추천: ${productName(rec.primary)}${rec.next ? ` → ${productName(rec.next)}` : ''}`,
    `진단번호 ${diagnosisNo}`,
    `${labelOf('industry', answers.industry)} · 직원 ${labelOf('staff', answers.staff)} · 월 문의 ${labelOf('leads', answers.leads)}`,
    `예산 ${labelOf('budget', answers.budget)} · 시작 ${labelOf('start', answers.start)}`,
    `고민: ${labelOf('pain', answers.pain)}`,
  ];
  if (calc && typeof calc.manual === 'number') lines.push(`계산기: 월 수작업 ${Math.round(calc.manual).toLocaleString('ko-KR')}원`);
  if (utm && Object.keys(utm).length) lines.push(`유입: ${Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  ctx.waitUntil(notifyTelegram(env, lines.join('\n')));

  return json({ ok: true, diagnosisNo, recommendation: rec });
}

function fallbackAnswers(): Answers {
  return Object.fromEntries(questions.map((q) => [q.id, q.multi ? [q.options[0].v] : q.options[0].v]));
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === '/api/diagnosis') return handleDiagnosis(req, env, ctx);
    if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'not found' }, 404);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
