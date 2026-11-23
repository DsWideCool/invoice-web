import "server-only";

// 로그인 무차별 대입 방지: IP당 10분에 5회 실패까지 허용
const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60_000;

interface FailureEntry {
  count: number;
  resetAt: number;
}

// 인스턴스 메모리 기반 (서버리스에서는 인스턴스별로 집계됨)
const failures = new Map<string, FailureEntry>();

// 차단 중이면 남은 시간(초)을, 아니면 null을 반환
export function getLoginBlockSeconds(ip: string): number | null {
  const entry = failures.get(ip);
  if (!entry) return null;
  if (entry.resetAt <= Date.now()) {
    failures.delete(ip);
    return null;
  }
  return entry.count >= MAX_FAILURES
    ? Math.ceil((entry.resetAt - Date.now()) / 1000)
    : null;
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const entry = failures.get(ip);
  if (!entry || entry.resetAt <= now) {
    failures.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginFailures(ip: string): void {
  failures.delete(ip);
}
