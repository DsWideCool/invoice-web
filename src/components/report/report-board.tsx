import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";

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
import { formatDate } from "@/lib/format";
import { withReturnPath } from "@/lib/return-path";
import { cn } from "@/lib/utils";
import type { PublicReportItem } from "@/types/report";

interface ReportBoardProps {
  items: PublicReportItem[];
  page: number;
  totalPages: number;
  // 돌아갈 견적서 경로 (게시판 안에서 이동해도 유지)
  returnPath: string | null;
}

function getItemHref(id: string, returnPath: string | null): string {
  return withReturnPath(`/report/list/${id.replace(/-/g, "")}`, returnPath);
}

function getPageHref(page: number, returnPath: string | null): string {
  return withReturnPath(`/report/list?page=${page}`, returnPath);
}

// 페이지 이동 (이전 · 번호 · 다음)
function Pagination({
  page,
  totalPages,
  returnPath,
}: Omit<ReportBoardProps, "items">) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="페이지 이동"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      <Button
        asChild={page > 1}
        variant="ghost"
        size="icon"
        disabled={page <= 1}
        aria-label="이전 페이지"
      >
        {page > 1 ? (
          <Link href={getPageHref(page - 1, returnPath)}>
            <ChevronLeft />
          </Link>
        ) : (
          <ChevronLeft />
        )}
      </Button>
      {pages.map((n) => (
        <Button
          key={n}
          asChild
          size="icon"
          variant={n === page ? "default" : "ghost"}
        >
          <Link
            href={getPageHref(n, returnPath)}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </Link>
        </Button>
      ))}
      <Button
        asChild={page < totalPages}
        variant="ghost"
        size="icon"
        disabled={page >= totalPages}
        aria-label="다음 페이지"
      >
        {page < totalPages ? (
          <Link href={getPageHref(page + 1, returnPath)}>
            <ChevronRight />
          </Link>
        ) : (
          <ChevronRight />
        )}
      </Button>
    </nav>
  );
}

// 공개 신고 게시판: 순번·제목·작성자(가림)·작성일·상태, 글을 누르면 비밀번호 입력 화면
export function ReportBoard({
  items,
  page,
  totalPages,
  returnPath,
}: ReportBoardProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        아직 등록된 신고가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 모바일: 카드형 목록 */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={getItemHref(item.id, returnPath)}
              className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
            >
              <span className="text-muted-foreground w-8 shrink-0 text-center text-xs tabular-nums">
                {item.seq}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Lock
                    className="text-muted-foreground size-3.5 shrink-0"
                    aria-label="비밀글"
                  />
                  <span className="truncate font-medium">{item.title}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {item.maskedAuthor} · {formatDate(item.createdAt)}
                </span>
              </div>
              <ReportStatusBadge status={item.status} className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      {/* 태블릿 이상: 게시판 테이블 (행 전체 클릭 가능) */}
      <div className="bg-card hidden rounded-lg border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 pl-4 text-center">번호</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-24">작성자</TableHead>
              <TableHead className="w-28">작성일</TableHead>
              <TableHead className="w-24 pr-4">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="relative">
                <TableCell className="text-muted-foreground pl-4 text-center tabular-nums">
                  {item.seq}
                </TableCell>
                <TableCell className="max-w-80">
                  <Link
                    href={getItemHref(item.id, returnPath)}
                    className={cn(
                      "flex items-center gap-1.5 font-medium hover:underline",
                      // after: 가상 요소로 링크 영역을 행 전체로 확장
                      "after:absolute after:inset-0",
                    )}
                  >
                    <Lock
                      className="text-muted-foreground size-3.5 shrink-0"
                      aria-label="비밀글"
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </TableCell>
                <TableCell>{item.maskedAuthor}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                <TableCell className="pr-4">
                  <ReportStatusBadge status={item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} totalPages={totalPages} returnPath={returnPath} />
    </div>
  );
}
