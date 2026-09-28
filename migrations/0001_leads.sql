-- 무료 자동화 진단 접수 테이블
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), -- UTC
  diagnosis_no TEXT NOT NULL UNIQUE,                  -- KNOB-YYYYMMDD-001 (한국 날짜)
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  answers_json TEXT NOT NULL,                         -- 10문항 응답
  recommendation TEXT NOT NULL,                       -- 추천 상품 id
  utm_json TEXT,                                      -- 유입경로 (utm_source 등)
  calc_json TEXT                                      -- 비용 계산기 값 (있을 때만)
);
CREATE INDEX IF NOT EXISTS idx_leads_phone_created ON leads (phone, created_at);
