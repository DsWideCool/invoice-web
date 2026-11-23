import { FileText } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/admin/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ADMIN_HOME_PATH } from "@/lib/auth/constants";

// 관리자 메뉴 (메뉴가 늘어나면 여기에 추가)
const ADMIN_NAV_ITEMS = [
  { href: ADMIN_HOME_PATH, label: "견적서 목록" },
] as const;

// 관리자 공통 헤더: 서비스명, 메뉴, 테마 토글, 로그아웃
// 375px: 서비스명 + 아이콘 버튼만 / 640px 이상: 메뉴·텍스트 버튼 표시
export function AdminHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href={ADMIN_HOME_PATH}
          className="flex items-center gap-2 font-semibold whitespace-nowrap"
        >
          <FileText className="text-primary size-5" aria-hidden />
          <span>견적서 관리</span>
        </Link>

        <nav aria-label="관리자 메뉴" className="hidden items-center sm:flex">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Button key={item.href} asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
