import { publicEnv } from "@/lib/public-env";

// 견적서 상세 경로 (하이픈 없는 32자리 ID 사용)
export function getInvoicePath(id: string): string {
  return `/invoice/${id.replace(/-/g, "")}`;
}

// 기준 도메인 + 견적서 경로로 절대 URL 생성 (도메인 끝 슬래시 정규화)
export function getInvoiceUrl(id: string, origin: string): string {
  return `${origin.replace(/\/+$/, "")}${getInvoicePath(id)}`;
}

// 링크 기준 도메인: NEXT_PUBLIC_APP_URL 우선, 없으면 현재 접속 도메인 (브라우저 전용)
export function getAppOrigin(): string {
  if (publicEnv.NEXT_PUBLIC_APP_URL) return publicEnv.NEXT_PUBLIC_APP_URL;

  if (process.env.NODE_ENV === "development") {
    console.warn(
      "NEXT_PUBLIC_APP_URL이 설정되지 않아 현재 접속 도메인으로 견적서 링크를 만듭니다.",
    );
  }
  return window.location.origin;
}

// 관리자용 견적서 상세 경로 (목록에서 이동, 클라이언트에게는 공유하지 않음)
export function getAdminInvoicePath(id: string): string {
  return `/admin/invoices/${id.replace(/-/g, "")}`;
}
