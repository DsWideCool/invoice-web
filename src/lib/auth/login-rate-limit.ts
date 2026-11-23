import "server-only";

import { createRateLimiter } from "@/lib/rate-limiter";

// 로그인 무차별 대입 방지: IP당 10분에 5회 실패까지 허용
const loginLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60_000 });

export const getLoginBlockSeconds = (ip: string) =>
  loginLimiter.getBlockSeconds(ip);
export const recordLoginFailure = (ip: string) => loginLimiter.record(ip);
export const clearLoginFailures = (ip: string) => loginLimiter.clear(ip);
