"use client";

import { ArrowLeft, Flag, List } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  getReturnLabel,
  getSafeReturnPath,
  RETURN_PARAM,
  withReturnPath,
} from "@/lib/return-path";

interface HeaderBarProps {
  // 신고 화면에서 돌아갈 견적서·이용 안내 경로
  returnPath: string | null;
  // 신고 화면에 있을 때만 "돌아가기" 링크 표시
  showBack: boolean;
}

function HeaderBar({ returnPath, showBack }: HeaderBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center gap-1 px-4 pt-3 sm:gap-2 sm:px-6 sm:pt-4 print:hidden">
      {showBack && returnPath && (
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={returnPath}>
            <ArrowLeft aria-hidden />
            {/* 375px에서는 짧은 문구로 줄여 가로 넘침 방지 */}
            <span className="sm:hidden">돌아가기</span>
            <span className="hidden sm:inline">
              {getReturnLabel(returnPath)}
            </span>
          </Link>
        </Button>
      )}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={withReturnPath("/report", returnPath)}>
            <Flag aria-hidden />
            신고하기
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={withReturnPath("/report/list", returnPath)}>
            <List aria-hidden />
            신고 목록
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}

function PublicHeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isReportPage = pathname.startsWith("/report");

  // 견적서·이용 안내 화면에서는 현재 경로를, 신고 화면에서는 전달받은 경로를 기억
  const returnPath = isReportPage
    ? getSafeReturnPath(searchParams.get(RETURN_PARAM))
    : getSafeReturnPath(pathname);

  return <HeaderBar returnPath={returnPath} showBack={isReportPage} />;
}

// 클라이언트용 화면(견적서·이용 안내·신고) 상단 바: 돌아가기 · 신고하기 · 신고 목록 · 테마 토글
export function PublicHeader() {
  return (
    // useSearchParams는 정적 페이지에서 Suspense 경계가 필요
    <Suspense fallback={<HeaderBar returnPath={null} showBack={false} />}>
      <PublicHeaderInner />
    </Suspense>
  );
}
