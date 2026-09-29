// 텔레그램 알림 자동 연결 도구 — 실행: npm run telegram:setup
// 1) 봇 토큰을 한 번 붙여넣으면 (화면에 안 보임)
// 2) 봇 확인 → 알림 받을 채팅방 번호 자동 찾기 → 테스트 메시지 → Cloudflare 비밀값 저장까지 자동으로 한다.
// 토큰은 화면·파일 어디에도 남기지 않는다.
import readline from 'node:readline';
import { spawn, execSync } from 'node:child_process';

const api = (token, method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  }).then((r) => r.json());

function ask(question, hidden = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // 입력한 글자를 화면에 찍지 않음
    rl._writeToOutput = (s) => {
      if (s.includes(question)) process.stdout.write(s);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (a) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(a.trim());
    }),
  );
}

// Cloudflare 비밀값 저장 (값은 표준입력으로만 전달)
function putSecret(name, value) {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['wrangler', 'secret', 'put', name], { shell: true, stdio: ['pipe', 'ignore', 'inherit'] });
    p.stdin.write(value);
    p.stdin.end();
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${name} 저장 실패 (코드 ${code})`))));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findChats(token) {
  const seen = new Map();
  for (let i = 0; i < 20; i++) {
    const r = await api(token, 'getUpdates', { timeout: 0, allowed_updates: ['message', 'my_chat_member', 'channel_post'] });
    if (!r.ok) return { error: r.description };
    for (const u of r.result) {
      const chat = u.message?.chat ?? u.my_chat_member?.chat ?? u.channel_post?.chat;
      if (chat) seen.set(chat.id, chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || String(chat.id));
    }
    if (seen.size) return { chats: [...seen] };
    if (i === 0) console.log('\n  ▶ 지금 텔레그램에서 이 봇에게 아무 메시지나 한 번 보내 주세요. (단체방이면 봇을 방에 초대한 뒤 방에서 한 번 말하기)');
    process.stdout.write('  기다리는 중' + '.'.repeat((i % 3) + 1) + '   \r');
    await sleep(3000);
  }
  return { chats: [] };
}

// 클립보드에 봇 토큰이 복사돼 있으면 그걸 쓴다 (붙여넣기 순서 헷갈림 방지)
function tokenFromClipboard() {
  try {
    const cmd = process.platform === 'win32' ? 'powershell -NoProfile -Command Get-Clipboard' : 'pbpaste';
    const v = execSync(cmd, { encoding: 'utf8' }).trim();
    return /^\d{6,}:[\w-]{30,}$/.test(v) ? v : '';
  } catch {
    return '';
  }
}

console.log('\n=== 노브 텔레그램 알림 연결 ===\n');
let token = tokenFromClipboard();
if (token) {
  const masked = `${token.slice(0, 4)}…${token.slice(-3)}`;
  const yes = await ask(`클립보드에서 봇 토큰(${masked})을 찾았습니다. 이걸로 연결할까요? [Enter=예 / n=아니오]: `);
  if (yes.toLowerCase() === 'n') token = '';
}
if (!token) {
  console.log('텔레그램 @BotFather 대화방의 토큰(숫자:영문)을 클릭해서 복사해 오세요.');
  token = await ask('봇 토큰 붙여넣기 (화면에 안 보입니다): ', true);
}

const me = await api(token, 'getMe');
if (!me.ok) {
  console.error('\n✗ 토큰이 맞지 않습니다. BotFather에서 다시 복사해 주세요.');
  process.exit(1);
}
console.log(`✓ 봇 확인: @${me.result.username}`);

let chatId;
const found = await findChats(token);
if (found.error) {
  // 이미 다른 시스템이 웹훅으로 이 봇을 쓰는 경우 getUpdates가 막힘
  console.log(`\n  이 봇은 다른 시스템(웹훅)에 연결돼 있어 채팅방 번호를 자동으로 찾을 수 없습니다. (${found.error})`);
  chatId = await ask('  채팅방 번호(chat id)를 직접 입력해 주세요: ');
} else if (found.chats.length === 0) {
  console.log('\n  1분 동안 메시지가 오지 않았습니다.');
  chatId = await ask('  채팅방 번호(chat id)를 알면 입력, 모르면 Enter 후 다시 실행: ');
  if (!chatId) process.exit(1);
} else if (found.chats.length === 1) {
  chatId = String(found.chats[0][0]);
  console.log(`\n✓ 알림 받을 곳: ${found.chats[0][1]} (${chatId})`);
} else {
  console.log('\n알림 받을 곳을 골라 주세요:');
  found.chats.forEach(([id, name], i) => console.log(`  ${i + 1}) ${name} (${id})`));
  const n = Number(await ask('번호: ')) - 1;
  chatId = String(found.chats[n]?.[0] ?? found.chats[0][0]);
}

const test = await api(token, 'sendMessage', { chat_id: chatId, text: '[노브] 진단 알림이 연결되었습니다. 앞으로 gonobe.com 진단 신청이 이 방으로 옵니다.' });
if (!test.ok) {
  console.error(`\n✗ 테스트 메시지 전송 실패: ${test.description}`);
  process.exit(1);
}
console.log('✓ 테스트 메시지 전송 — 텔레그램을 확인해 보세요.');

console.log('\nCloudflare에 저장하는 중...');
await putSecret('TELEGRAM_BOT_TOKEN', token);
await putSecret('TELEGRAM_CHAT_ID', chatId);
console.log('\n✓ 완료! 이제 gonobe.com 진단 신청이 텔레그램으로 옵니다.\n');
