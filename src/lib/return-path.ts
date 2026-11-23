// 신고 화면에서 돌아갈 클라이언트 화면 경로 (?from=) 처리

export const RETURN_PARAM = "from";

// 돌아갈 수 있는 경로: 견적서 화면(32자리 ID)과 이용 안내만 허용 (관리자·외부 경로 차단)
const RETURN_PATH_PATTERN = /^\/invoice\/(?:[0-9a-f]{32}|guide)$/;

export function getSafeReturnPath(
  value: string | null | undefined,
): string | null {
  return value && RETURN_PATH_PATTERN.test(value) ? value : null;
}

// 링크에 돌아갈 경로를 붙임 (없으면 그대로)
export function withReturnPath(
  href: string,
  returnPath: string | null,
): string {
  if (!returnPath) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${RETURN_PARAM}=${encodeURIComponent(returnPath)}`;
}

export function getReturnLabel(returnPath: string): string {
  return returnPath === "/invoice/guide"
    ? "이용 안내로 돌아가기"
    : "견적서로 돌아가기";
}
