import { KeyRound } from "lucide-react";

import { InvoiceList } from "@/components/admin/invoice-list";
import { ListActions } from "@/components/admin/list-actions";
import { LoginForm } from "@/components/admin/login-form";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { isAdminAuthenticated } from "@/lib/auth/session";
import { getAdminPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/env";
import { getInvoiceList } from "@/lib/services/invoice.service";

// 관리자 비밀번호가 설정되지 않았을 때 안내
function AdminPasswordNotice() {
  return (
    <Card className="w-full max-w-md self-center">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <KeyRound className="text-muted-foreground size-10" aria-hidden />
        <h1 className="text-lg font-semibold">관리자 비밀번호가 필요합니다</h1>
        <p className="text-muted-foreground text-sm">
          <code className="bg-muted rounded px-1">.env.local</code>에{" "}
          <code className="bg-muted rounded px-1">ADMIN_PASSWORD</code>를{" "}
          {MIN_ADMIN_PASSWORD_LENGTH}자 이상으로 설정한 뒤 서버를 다시 시작해
          주세요.
        </p>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  if (!getAdminPassword()) {
    return (
      <PageContainer className="min-h-dvh justify-center">
        <AdminPasswordNotice />
      </PageContainer>
    );
  }

  if (!(await isAdminAuthenticated())) {
    return (
      <PageContainer className="min-h-dvh justify-center">
        <LoginForm />
      </PageContainer>
    );
  }

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
