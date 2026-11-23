import type { Metadata } from "next";

import { AdminPasswordNotice } from "@/components/admin/admin-password-notice";
import { PageContainer } from "@/components/layout/page-container";
import { CornerThemeToggle } from "@/components/theme-toggle";
import { isAdminLoginConfigured } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "관리자",
    template: "%s | 견적서 관리자",
  },
};

// 관리자 화면 공통 레이아웃: 비밀번호 미설정 시 모든 관리자 경로에서 안내만 표시
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isAdminLoginConfigured()) {
    return (
      <PageContainer className="min-h-dvh justify-center">
        <CornerThemeToggle />
        <AdminPasswordNotice />
      </PageContainer>
    );
  }

  return children;
}
