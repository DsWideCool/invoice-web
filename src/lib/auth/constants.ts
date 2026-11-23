// 서버·미들웨어·클라이언트에서 함께 쓰는 관리자 인증 상수와 유틸

export const SESSION_COOKIE = "admin_session";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const NEXT_PARAM = "next";

// 로그인 후 돌아갈 경로 검증 (오픈 리다이렉트 방지: 같은 사이트의 상대 경로만 허용)
export function getSafeNextPath(value: string | string[] | undefined): string {
  if (typeof value !== "string") return ADMIN_HOME_PATH;
  // "//evil.com", "/\evil.com" 같은 프로토콜 상대 URL 차단
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return ADMIN_HOME_PATH;

  try {
    const base = "http://localhost";
    const url = new URL(value, base);
    if (url.origin !== base) return ADMIN_HOME_PATH;
    // 로그인 화면으로 돌아가면 무한 루프가 되므로 제외
    if (url.pathname === ADMIN_LOGIN_PATH) return ADMIN_HOME_PATH;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return ADMIN_HOME_PATH;
  }
}

// 세션 토큰("admin.<만료시각>.<서명>")의 만료 여부만 확인 (서명 검증은 서버에서 수행)
export function isSessionTokenUnexpired(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = Number(token.split(".")[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
