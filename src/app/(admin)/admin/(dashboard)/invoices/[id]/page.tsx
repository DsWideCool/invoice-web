import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyLinkButton } from "@/components/admin/copy-link-button";
import { InvoiceView } from "@/components/invoice/invoice-view";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ADMIN_HOME_PATH } from "@/lib/auth/constants";
import { requireAdmin } from "@/lib/auth/session";
import { getInvoicePath } from "@/lib/invoice-url";
import { getInvoice } from "@/lib/services/invoice.service";

interface AdminInvoicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminInvoicePageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoice(id);
  return { title: invoice ? `견적서 ${invoice.invoiceNumber}` : "견적서" };
}

// 관리자용 견적서 화면: 목록 복귀·클라이언트 링크 복사·클라이언트 화면 미리보기
export default async function AdminInvoicePage({
  params,
}: AdminInvoicePageProps) {
  await requireAdmin();

  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href={ADMIN_HOME_PATH}>
            <ArrowLeft />
            목록으로
          </Link>
        </Button>
        <div className="flex items-center gap-1">
          <CopyLinkButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
          />
          <Button asChild variant="outline" size="sm">
            {/* 새 탭에서 클라이언트가 보는 화면 그대로 확인 */}
            <a
              href={getInvoicePath(invoice.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink />
              클라이언트 화면
            </a>
          </Button>
        </div>
      </div>
      <InvoiceView invoice={invoice} />
    </PageContainer>
  );
}
