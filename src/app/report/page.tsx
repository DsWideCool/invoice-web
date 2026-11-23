import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { ReportForm } from "@/components/report/report-form";
import { ReportUnavailable } from "@/components/report/report-unavailable";
import { getSafeReturnPath, RETURN_PARAM } from "@/lib/return-path";
import { isReportFeatureEnabled } from "@/lib/services/report.service";

export const metadata: Metadata = {
  title: "신고하기",
};

// 신고 DB 설정 여부를 빌드 시점이 아니라 요청 시점에 판단
export const dynamic = "force-dynamic";

interface ReportPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const from = (await searchParams)[RETURN_PARAM];
  const returnPath = getSafeReturnPath(typeof from === "string" ? from : null);

  return (
    <PageContainer className="pt-2 sm:pt-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          신고하기
        </h1>
        <p className="text-muted-foreground text-sm">
          작성한 신고는 관리자가 접수한 뒤 답변을 드리며, 신고 번호로 처리
          상태를 확인할 수 있습니다.
        </p>
      </div>
      {isReportFeatureEnabled() ? (
        <ReportForm returnPath={returnPath} />
      ) : (
        <ReportUnavailable />
      )}
    </PageContainer>
  );
}
