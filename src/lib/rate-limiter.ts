import "server-only";

interface LimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  // 차단 중이면 남은 시간(초)을, 아니면 null을 반환
  getBlockSeconds(key: string): number | null;
  record(key: string): void;
  clear(key: string): void;
}

// 키(IP 등)별로 일정 시간 동안 허용 횟수를 세는 메모리 기반 제한기
// 서버리스에서는 인스턴스마다 따로 집계됨 (현 단계에서는 허용)
export function createRateLimiter(options: {
  max: number;
  windowMs: number;
}): RateLimiter {
  const entries = new Map<string, LimitEntry>();

  const cleanup = (now: number) => {
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
  };

  return {
    getBlockSeconds(key) {
      const entry = entries.get(key);
      if (!entry) return null;
      if (entry.resetAt <= Date.now()) {
        entries.delete(key);
        return null;
      }
      return entry.count >= options.max
        ? Math.ceil((entry.resetAt - Date.now()) / 1000)
        : null;
    },
    record(key) {
      const now = Date.now();
      if (entries.size > 1000) cleanup(now);
      const entry = entries.get(key);
      if (!entry || entry.resetAt <= now) {
        entries.set(key, { count: 1, resetAt: now + options.windowMs });
        return;
      }
      entry.count += 1;
    },
    clear(key) {
      entries.delete(key);
    },
  };
}

// 차단 안내 문구
export function formatBlockMessage(seconds: number): string {
  return `요청이 너무 많습니다. ${Math.ceil(seconds / 60)}분 후 다시 시도해 주세요.`;
}
