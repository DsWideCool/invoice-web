import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { InvoiceItem } from "@/types/invoice";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
}

export function InvoiceItemsTable({ items }: InvoiceItemsTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        등록된 견적 항목이 없습니다.
      </p>
    );
  }

  return (
    <>
      {/* 모바일: 카드형 목록 */}
      <ul className="flex flex-col divide-y sm:hidden">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 py-3">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium break-all">{item.name}</span>
              <span className="shrink-0 font-semibold">
                {formatCurrency(item.amount)}
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              {formatCurrency(item.unitPrice)} × {item.quantity}
            </span>
          </li>
        ))}
      </ul>

      {/* 태블릿 이상: 테이블 */}
      <Table className="hidden sm:table">
        <TableHeader>
          <TableRow>
            <TableHead>항목명</TableHead>
            <TableHead className="w-20 text-right">수량</TableHead>
            <TableHead className="w-40 text-right">단가</TableHead>
            <TableHead className="w-40 text-right">금액</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium whitespace-normal">
                {item.name}
              </TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
