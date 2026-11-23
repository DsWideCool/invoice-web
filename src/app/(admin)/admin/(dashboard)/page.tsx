import type { Metadata } from "next";

import { InvoiceList } from "@/components/admin/invoice-list";
import { ListActions } from "@/components/admin/list-actions";
import { PageContainer } from "@/components/layout/page-container";
import { requireAdmin } from "@/lib/auth/session";
import { getInvoiceList } from "@/lib/services/invoice.service";

export const metadata: Metadata = {
  title: "견적서 목록",
};

export default async function AdminInvoiceListPage() {
  // 레이아웃과 페이지는 병렬로 렌더링되므로 데이터 조회 전에 페이지에서도 인증 확인
  await requireAdmin();

  const invoices = await getInvoiceList();

  return (
    <PageContainer className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            견적서 목록
          </h1>
          <p className="text-muted-foreground text-sm">
            견적서를 선택하면 상세 내용을 볼 수 있습니다.
          </p>
        </div>
        <ListActions />
      </div>
      <InvoiceList invoices={invoices} />
    </PageContainer>
  );
}
