import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceItemsTable } from "@/components/invoice/invoice-items-table";
import { InvoiceSummary } from "@/components/invoice/invoice-summary";
import { PdfDownloadButton } from "@/components/invoice/pdf-download-button";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { getInvoice } from "@/lib/services/invoice.service";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: InvoicePageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);
  return {
    title: invoice
      ? `견적서 ${invoice.invoiceNumber}`
      : "견적서를 찾을 수 없습니다",
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  // 관리자에게만 목록으로 돌아가는 링크 표시 (클라이언트에게는 숨김)
  const isAdmin = await isAdminAuthenticated();

  return (
    <PageContainer>
      {isAdmin && (
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/">
            <ArrowLeft />
            목록으로
          </Link>
        </Button>
      )}
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
    </PageContainer>
  );
}
