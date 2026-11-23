import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReportAdminPanel } from "@/components/admin/report-admin-panel";
import { PageContainer } from "@/components/layout/page-container";
import { ReportDetail } from "@/components/report/report-detail";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import {
  getReport,
  isReportFeatureEnabled,
} from "@/lib/services/report.service";

export const metadata: Metadata = {
  title: "신고 상세",
};

interface AdminReportDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReportDetailPage({
  params,
}: AdminReportDetailPageProps) {
  await requireAdmin();
  if (!isReportFeatureEnabled()) notFound();

  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  return (
    <PageContainer>
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link href="/admin/reports">
          <ArrowLeft />
          신고 목록으로
        </Link>
      </Button>
      <ReportDetail report={report} />
      <ReportAdminPanel report={report} />
    </PageContainer>
  );
}
