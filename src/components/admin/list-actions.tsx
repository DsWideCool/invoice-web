"use client";

import { LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { logoutAction, refreshInvoicesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 목록 상단의 새로고침 / 로그아웃 버튼
export function ListActions() {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [isLoggingOut, startLogout] = useTransition();

  const handleRefresh = () => {
    startRefresh(async () => {
      await refreshInvoicesAction();
      router.refresh();
    });
  };

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAction();
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-label="Notion에서 최신 견적서 다시 불러오기"
      >
        <RefreshCw className={cn(isRefreshing && "animate-spin")} />
        새로고침
      </Button>
      <Button variant="ghost" onClick={handleLogout} disabled={isLoggingOut}>
        <LogOut />
        <span className="sr-only sm:not-sr-only">로그아웃</span>
      </Button>
    </div>
  );
}
