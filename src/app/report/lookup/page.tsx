import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { ReportLookup } from "@/components/report/report-lookup";
import { ReportUnavailable } from "@/components/report/report-unavailable";
import { isReportFeatureEnabled } from "@/lib/services/report.service";
import { REPORT_NUMBER_PATTERN } from "@/lib/validations/report";

export const metadata: Metadata = {
  title: "내 신고 조회",
};

interface ReportLookupPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportLookupPage({
  searchParams,
}: ReportLookupPageProps) {
  // 신고 완료 화면에서 넘어온 번호만 미리 채움 (형식이 맞을 때만)
  const number = (await searchParams).number;
  const defaultNumber =
    typeof number === "string" && REPORT_NUMBER_PATTERN.test(number)
      ? number
      : "";

  return (
    <PageContainer className="pt-2 sm:pt-4">
      {isReportFeatureEnabled() ? (
        <ReportLookup defaultNumber={defaultNumber} />
      ) : (
        <ReportUnavailable />
      )}
    </PageContainer>
  );
}
