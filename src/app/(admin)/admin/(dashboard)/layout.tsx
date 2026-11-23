import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/auth/session";

// 인증된 관리자 화면 공통 레이아웃: 관리자 헤더 + 본문
export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminHeader />
      {children}
    </div>
  );
}
