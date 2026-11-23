import { StatusBadge } from "@/components/invoice/status-badge";
import { formatDate } from "@/lib/format";
import type { Invoice } from "@/types/invoice";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">견적서</p>
          <h1 className="text-2xl font-semibold tracking-tight break-all sm:text-3xl">
            {invoice.invoiceNumber || "번호 없음"}
          </h1>
        </div>
        <StatusBadge status={invoice.status} className="h-6 px-3 text-sm" />
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoRow label="클라이언트" value={invoice.clientName || "-"} />
        <InfoRow label="발행일" value={formatDate(invoice.issueDate)} />
        <InfoRow label="유효기간" value={formatDate(invoice.validUntil)} />
      </dl>
    </div>
  );
}
