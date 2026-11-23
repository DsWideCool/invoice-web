"use client";

import { Loader2, LogOut } from "lucide-react";
import { useTransition } from "react";

import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

// 관리자 헤더의 로그아웃 버튼 (서버 액션이 로그인 화면으로 리다이렉트)
// 375px에서는 아이콘만, 640px 이상에서 텍스트 표시
export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
      className="size-9 px-0 sm:h-9 sm:w-auto sm:px-2.5"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
      <span className="sr-only sm:not-sr-only">로그아웃</span>
    </Button>
  );
}
