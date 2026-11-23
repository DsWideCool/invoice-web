import { formatCurrency } from "@/lib/format";
import type { Invoice } from "@/types/invoice";

interface InvoiceSummaryProps {
  invoice: Invoice;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const itemsTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  // Notion `총 금액`과 항목 합계가 다를 때만 항목 합계를 함께 표시
  const showItemsTotal =
    invoice.items.length > 0 && itemsTotal !== invoice.totalAmount;

  return (
    <dl className="flex flex-col gap-2 sm:ml-auto sm:w-72">
      {showItemsTotal && (
        <div className="text-muted-foreground flex justify-between text-sm">
          <dt>항목 합계</dt>
          <dd>{formatCurrency(itemsTotal)}</dd>
        </div>
      )}
      <div className="flex items-baseline justify-between gap-4">
        <dt className="font-medium">총 금액</dt>
        <dd className="text-xl font-bold sm:text-2xl">
          {formatCurrency(invoice.totalAmount)}
        </dd>
      </div>
    </dl>
  );
}
