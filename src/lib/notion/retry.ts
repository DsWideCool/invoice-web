import "server-only";

import { APIErrorCode, isNotionClientError } from "@notionhq/client";

// Notion 속도 제한(429) 시 재시도 설정
const MAX_RATE_LIMIT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 5000;

// 응답 헤더의 Retry-After(초)를 밀리초로 변환 (없으면 기본값)
function getRetryDelayMs(error: unknown): number {
  const headers =
    isNotionClientError(error) && "headers" in error ? error.headers : null;
  const retryAfter =
    headers instanceof Headers ? Number(headers.get("retry-after")) : NaN;
  const delay =
    Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : DEFAULT_RETRY_DELAY_MS;
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

// 429(rate_limited)에 한해 Retry-After만큼 기다렸다가 최대 2회 재시도
export async function withRateLimitRetry<T>(
  request: () => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      const isRateLimited =
        isNotionClientError(error) && error.code === APIErrorCode.RateLimited;
      if (!isRateLimited || attempt >= MAX_RATE_LIMIT_RETRIES) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, getRetryDelayMs(error)),
      );
    }
  }
}
