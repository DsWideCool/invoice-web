import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { ReportUnlock } from "@/components/report/report-unlock";
import { Button } from "@/components/ui/button";
import {
  getSafeReturnPath,
  RETURN_PARAM,
  withReturnPath,
} from "@/lib/return-path";
import {
  getPublicReportItem,
  isReportFeatureEnabled,
} from "@/lib/services/report.service";

export const metadata: Metadata = {
  title: "신고 글",
};

interface ReportItemPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 신고 글 화면: 비밀번호 입력 전에는 제목·가린 작성자·작성일·상태만 표시
export default async function ReportItemPage({
  params,
  searchParams,
}: ReportItemPageProps) {
  if (!isReportFeatureEnabled()) notFound();

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const from = query[RETURN_PARAM];
  const returnPath = getSafeReturnPath(typeof from === "string" ? from : null);

  const item = await getPublicReportItem(id);
  if (!item) notFound();

  return (
    <PageContainer className="pt-2 sm:pt-4">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link href={withReturnPath("/report/list", returnPath)}>
          <ArrowLeft />
          신고 목록으로
        </Link>
      </Button>
      <ReportUnlock item={item} />
    </PageContainer>
  );
}
