import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceItemsTable } from "@/components/invoice/invoice-items-table";
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { PdfDownloadButton } from "@/components/invoice/pdf-download-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from "@/types/invoice";

// 견적서 본문 (헤더·항목·금액·PDF 다운로드) — 클라이언트·관리자 화면 공용
export function InvoiceView({ invoice }: { invoice: Invoice }) {
  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <InvoiceHeader invoice={invoice} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>견적 항목</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InvoiceItemsTable items={invoice.items} />
          <Separator />
          <InvoiceSummary invoice={invoice} />
        </CardContent>
      </Card>

      <PdfDownloadButton
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
      />
    </>
  );
}
