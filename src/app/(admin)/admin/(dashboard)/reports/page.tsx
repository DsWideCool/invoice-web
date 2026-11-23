import type { Metadata } from "next";

import { ReportList } from "@/components/admin/report-list";
import { PageContainer } from "@/components/layout/page-container";
import { ReportUnavailable } from "@/components/report/report-unavailable";
import { requireAdmin } from "@/lib/auth/session";
import {
  isReportFeatureEnabled,
  listReports,
} from "@/lib/services/report.service";

export const metadata: Metadata = {
  title: "신고 관리",
};

export default async function AdminReportsPage() {
  await requireAdmin();

  const enabled = isReportFeatureEnabled();
  // 신고는 처리 상태가 자주 바뀌므로 캐시 없이 매번 조회
  const reports = enabled ? await listReports() : [];

  return (
    <PageContainer className="max-w-5xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          신고 관리
        </h1>
        <p className="text-muted-foreground text-sm">
          작성된 신고를 접수하고 답변을 등록하면 처리완료됩니다.
        </p>
      </div>
      {enabled ? (
        <ReportList reports={reports} />
      ) : (
        <ReportUnavailable forAdmin />
      )}
    </PageContainer>
  );
}
