import "server-only";

import { headers } from "next/headers";

// 서버 액션에서 요청 IP 조회 (프록시 헤더 우선)
export async function getRequestIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}
