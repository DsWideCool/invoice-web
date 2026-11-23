import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_LOGIN_PATH,
  isSessionTokenUnexpired,
  NEXT_PARAM,
  SESSION_COOKIE,
} from "@/lib/auth/constants";

// API 요청 제한: IP당 1분에 10회
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// 인스턴스 메모리 기반 저장소 (서버리스에서는 인스턴스별로 따로 집계됨)
const store = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// 만료된 항목 정리 (메모리 증가 방지)
function cleanup(now: number) {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

// /api: IP별 요청 수 제한
function handleApiRateLimit(request: NextRequest): NextResponse {
  const now = Date.now();
  if (store.size > 1000) cleanup(now);

  const ip = getClientIp(request);
  let entry = store.get(ip);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }
  entry.count += 1;

  const remaining = Math.max(0, RATE_LIMIT - entry.count);
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  const headers = {
    "X-RateLimit-Limit": String(RATE_LIMIT),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
  };

  if (entry.count > RATE_LIMIT) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(retryAfter) },
      },
    );
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

// /admin: 세션 쿠키가 없거나 만료되면 로그인 화면으로 (원래 경로는 next로 전달)
// 서명 검증은 서버 컴포넌트의 requireAdmin()에서 다시 수행
function handleAdminGuard(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  if (pathname === ADMIN_LOGIN_PATH) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (isSessionTokenUnexpired(token)) return NextResponse.next();

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  // 관리자 경로에는 API 속도 제한을 적용하지 않음
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return handleAdminGuard(request);
  }
  return handleApiRateLimit(request);
}

export const config = {
  matcher: ["/api/:path*", "/admin", "/admin/:path*"],
};
