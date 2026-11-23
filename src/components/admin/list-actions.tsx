"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { refreshInvoicesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 목록 상단의 새로고침 버튼 (로그아웃은 관리자 헤더로 이동)
export function ListActions() {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  const handleRefresh = () => {
    startRefresh(async () => {
      await refreshInvoicesAction();
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleRefresh}
      disabled={isRefreshing}
      aria-label="Notion에서 최신 견적서 다시 불러오기"
    >
      <RefreshCw className={cn(isRefreshing && "animate-spin")} />
      새로고침
    </Button>
  );
}
