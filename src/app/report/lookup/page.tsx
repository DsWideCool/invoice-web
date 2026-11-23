import { redirect } from "next/navigation";

import { RETURN_PARAM } from "@/lib/return-path";

interface ReportLookupPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 예전 "내 신고 조회" 주소는 신고 목록(게시판)으로 이동 (돌아갈 경로는 유지)
export default async function ReportLookupPage({
  searchParams,
}: ReportLookupPageProps) {
  const from = (await searchParams)[RETURN_PARAM];
  redirect(
    typeof from === "string"
      ? `/report/list?${RETURN_PARAM}=${encodeURIComponent(from)}`
      : "/report/list",
  );
}
