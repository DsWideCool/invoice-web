import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { PageContainer } from "@/components/layout/page-container";
import { CornerThemeToggle } from "@/components/theme-toggle";
import { getSafeNextPath, NEXT_PARAM } from "@/lib/auth/constants";
import { isAdminAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "로그인",
};

interface AdminLoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// 관리자 로그인: 헤더 없는 중앙 카드 레이아웃
export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  // 로그인 후 돌아갈 경로 (외부 URL은 /admin으로 대체)
  const redirectTo = getSafeNextPath((await searchParams)[NEXT_PARAM]);

  // 이미 로그인한 관리자는 바로 이동
  if (await isAdminAuthenticated()) redirect(redirectTo);

  return (
    <PageContainer className="min-h-dvh justify-center">
      <CornerThemeToggle />
      <LoginForm redirectTo={redirectTo} />
    </PageContainer>
  );
}
