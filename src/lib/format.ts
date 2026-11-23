// 금액을 원화 형식으로 표시 (예: 1,000,000원)
export function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

// YYYY-MM-DD 문자열을 한국어 날짜로 표시 (예: 2026. 11. 10.)
export function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}

// ISO 시각을 한국어 날짜·시간으로 표시 (예: 2026. 11. 23. 오후 02:30)
export function formatDateTime(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(date);
}
