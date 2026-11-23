import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InvoiceView } from "@/components/invoice/invoice-view";
import { PageContainer } from "@/components/layout/page-container";
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

// 클라이언트용 견적서 화면: 링크를 받은 사람은 이 견적서만 볼 수 있음
// 관리자 목록 등 다른 화면으로 가는 링크는 두지 않음 (관리자는 /admin/invoices/[id] 사용)
export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  return (
    <PageContainer className="pt-2 sm:pt-4">
      <InvoiceView invoice={invoice} />
    </PageContainer>
  );
}
