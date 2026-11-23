"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ReportStatusBadge } from "@/components/report/report-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import {
  REPORT_STATUSES,
  type ReportStatus,
  type ReportSummary,
} from "@/types/report";

type StatusFilter = ReportStatus | "전체";

const STATUS_FILTERS: StatusFilter[] = ["전체", ...REPORT_STATUSES];

function getReportHref(id: string): string {
  return `/admin/reports/${id.replace(/-/g, "")}`;
}

// 관리자 신고 목록: 상태 필터 + 모바일 카드 / 640px 이상 테이블
export function ReportList({ reports }: { reports: ReportSummary[] }) {
  const [status, setStatus] = useState<StatusFilter>("전체");

  // 상태별 건수 (필터 버튼에 표시)
  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      전체: reports.length,
      작성: 0,
      접수: 0,
      처리완료: 0,
    };
    for (const report of reports) result[report.status] += 1;
    return result;
  }, [reports]);

  const filtered = useMemo(
    () =>
      status === "전체"
        ? reports
        : reports.filter((report) => report.status === status),
    [reports, status],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1" role="group" aria-label="상태 필터">
        {STATUS_FILTERS.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={status === option ? "default" : "outline"}
            aria-pressed={status === option}
            onClick={() => setStatus(option)}
          >
            {option} {counts[option]}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {reports.length === 0
            ? "아직 접수된 신고가 없습니다."
            : "해당 상태의 신고가 없습니다."}
        </p>
      ) : (
        <>
          {/* 모바일: 카드형 목록 */}
          <ul className="flex flex-col gap-2 sm:hidden">
            {filtered.map((report) => (
              <li key={report.id}>
                <Link
                  href={getReportHref(report.id)}
                  className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {report.title}
                      </span>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <span className="text-muted-foreground truncate text-xs">
                      <span className="font-mono">{report.reportNumber}</span> ·{" "}
                      {formatDateTime(report.createdAt)}
                    </span>
                  </div>
                  <ChevronRight
                    className="text-muted-foreground size-4 shrink-0"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* 태블릿 이상: 테이블 (행 전체 클릭 가능) */}
          <div className="bg-card hidden rounded-lg border sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">신고 번호</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>작성일시</TableHead>
                  <TableHead className="pr-4">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((report) => (
                  <TableRow key={report.id} className="relative">
                    <TableCell className="pl-4 font-mono text-xs">
                      {report.reportNumber}
                    </TableCell>
                    <TableCell className="max-w-72 font-medium">
                      {/* after: 가상 요소로 링크 영역을 행 전체로 확장 */}
                      <Link
                        href={getReportHref(report.id)}
                        className="block truncate after:absolute after:inset-0 hover:underline"
                      >
                        {report.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDateTime(report.createdAt)}</TableCell>
                    <TableCell className="pr-4">
                      <ReportStatusBadge status={report.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
