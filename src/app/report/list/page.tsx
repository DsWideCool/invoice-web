import { PenLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { ReportBoard } from "@/components/report/report-board";
import { ReportUnavailable } from "@/components/report/report-unavailable";
import { Button } from "@/components/ui/button";
import {
  getSafeReturnPath,
  RETURN_PARAM,
  withReturnPath,
} from "@/lib/return-path";
import {
  isReportFeatureEnabled,
  listPublicReports,
} from "@/lib/services/report.service";

export const metadata: Metadata = {
  title: "신고 목록",
};

// 신고 상태가 바뀌면 바로 보이도록 요청 시점에 렌더링
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

interface ReportListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportListPage({
  searchParams,
}: ReportListPageProps) {
  const params = await searchParams;
  const from = params[RETURN_PARAM];
  const returnPath = getSafeReturnPath(typeof from === "string" ? from : null);
  const enabled = isReportFeatureEnabled();

  const all = enabled ? await listPublicReports() : [];
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const requested = Number(params.page);
  const page =
    Number.isInteger(requested) && requested >= 1
      ? Math.min(requested, totalPages)
      : 1;
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageContainer className="pt-2 sm:pt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            신고 목록
          </h1>
          <p className="text-muted-foreground text-sm">
            내가 쓴 글을 선택하고 조회 비밀번호를 입력하면 처리 상태와 답변을 볼
            수 있습니다.
          </p>
        </div>
        {enabled && (
          <Button asChild>
            <Link href={withReturnPath("/report", returnPath)}>
              <PenLine />
              신고하기
            </Link>
          </Button>
        )}
      </div>
      {enabled ? (
        <ReportBoard
          items={items}
          page={page}
          totalPages={totalPages}
          returnPath={returnPath}
        />
      ) : (
        <ReportUnavailable />
      )}
    </PageContainer>
  );
}
