import { Flag, Search } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

// 클라이언트용 화면(견적서·이용 안내·신고) 상단 바: 신고하기 · 내 신고 조회 · 테마 토글
export function PublicHeader() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-end gap-1 px-4 pt-3 sm:gap-2 sm:px-6 sm:pt-4 print:hidden">
      <Button asChild variant="outline" size="sm">
        <Link href="/report">
          <Flag aria-hidden />
          신고하기
        </Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href="/report/lookup">
          <Search aria-hidden />내 신고 조회
        </Link>
      </Button>
      <ThemeToggle />
    </div>
  );
}
