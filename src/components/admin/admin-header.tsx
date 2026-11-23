import { FileText } from "lucide-react";
import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ADMIN_HOME_PATH } from "@/lib/auth/constants";

// 관리자 공통 헤더: 서비스명, 메뉴, 테마 토글, 로그아웃
// 375px: 로고 아이콘 + 메뉴 + 아이콘 버튼 / 640px 이상: 서비스명·로그아웃 텍스트 표시
export function AdminHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4 sm:gap-4 sm:px-6">
        <Link
          href={ADMIN_HOME_PATH}
          className="flex items-center gap-2 font-semibold whitespace-nowrap"
          aria-label="견적서 관리 홈"
        >
          <FileText className="text-primary size-5" aria-hidden />
          <span className="hidden sm:inline">견적서 관리</span>
        </Link>

        <AdminNav />

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
