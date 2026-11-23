"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { StatusBadge } from "@/components/invoice/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { getInvoicePath } from "@/lib/invoice-url";
import {
  INVOICE_STATUSES,
  type InvoiceListItem,
  type InvoiceStatus,
} from "@/types/invoice";

type StatusFilter = InvoiceStatus | "전체";

const STATUS_FILTERS: StatusFilter[] = ["전체", ...INVOICE_STATUSES];

interface InvoiceListProps {
  invoices: InvoiceListItem[];
}

function formatAmount(value: number | null): string {
  return value === null ? "-" : formatCurrency(value);
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("전체");

  // 견적서 번호·클라이언트명 검색 + 상태 필터
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (status !== "전체" && invoice.status !== status) return false;
      if (!keyword) return true;
      return (
        invoice.invoiceNumber.toLowerCase().includes(keyword) ||
        invoice.clientName.toLowerCase().includes(keyword)
      );
    });
  }, [invoices, query, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="견적서 번호, 클라이언트명 검색"
            aria-label="견적서 검색"
            className="pl-8"
          />
        </div>
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="상태 필터"
        >
          {STATUS_FILTERS.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={status === option ? "default" : "outline"}
              aria-pressed={status === option}
              onClick={() => setStatus(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        총 {filtered.length}건
        {filtered.length !== invoices.length && ` / 전체 ${invoices.length}건`}
      </p>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {invoices.length === 0
            ? "Notion에 등록된 견적서가 없습니다."
            : "조건에 맞는 견적서가 없습니다."}
        </p>
      ) : (
        <>
          {/* 모바일: 카드형 목록 */}
          <ul className="flex flex-col gap-2 sm:hidden">
            {filtered.map((invoice) => (
              // 링크 영역 + 액션 버튼 구조 (<a> 안에 <button> 중첩 금지)
              <li
                key={invoice.id}
                className="bg-card has-[a:hover]:bg-muted/50 flex items-center rounded-lg border transition-colors"
              >
                <Link
                  href={getInvoicePath(invoice.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 py-4 pl-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">
                        {invoice.invoiceNumber || "번호 없음"}
                      </span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <span className="text-muted-foreground truncate text-sm">
                      {invoice.clientName || "-"} ·{" "}
                      {formatDate(invoice.issueDate)}
                    </span>
                    <span className="font-semibold">
                      {formatAmount(invoice.totalAmount)}
                    </span>
                  </div>
                  <ChevronRight
                    className="text-muted-foreground size-4 shrink-0"
                    aria-hidden
                  />
                </Link>
                <CopyLinkButton
                  invoiceId={invoice.id}
                  invoiceNumber={invoice.invoiceNumber}
                  className="mx-2 shrink-0"
                />
              </li>
            ))}
          </ul>

          {/* 태블릿 이상: 테이블 (행 전체 클릭 가능) */}
          <div className="bg-card hidden rounded-lg border sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">견적서 번호</TableHead>
                  <TableHead>클라이언트</TableHead>
                  <TableHead>발행일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">총 금액</TableHead>
                  <TableHead className="w-12 pr-4">
                    <span className="sr-only">링크 복사</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id} className="relative">
                    <TableCell className="pl-4 font-medium">
                      {/* after: 가상 요소로 링크 영역을 행 전체로 확장 */}
                      <Link
                        href={getInvoicePath(invoice.id)}
                        className="after:absolute after:inset-0 hover:underline"
                      >
                        {invoice.invoiceNumber || "번호 없음"}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.clientName || "-"}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatAmount(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="pr-4">
                      {/* relative z-10: 행 전체 링크 오버레이 위에 배치해 클릭 시 상세로 이동하지 않음 */}
                      <CopyLinkButton
                        invoiceId={invoice.id}
                        invoiceNumber={invoice.invoiceNumber}
                        className="relative z-10"
                      />
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
