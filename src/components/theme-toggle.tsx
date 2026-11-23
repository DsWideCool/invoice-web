"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

// 클릭할 때마다 라이트 ↔ 다크 전환 (처음 방문 시에는 OS 설정을 따름)
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn("size-9 print:hidden", className)}
      aria-label="라이트/다크 모드 전환"
      title="라이트/다크 모드 전환"
    >
      {/* 마운트 전 테마 값과 무관하게 html의 dark 클래스로 아이콘 전환 (hydration 불일치 방지) */}
      <Sun className="dark:hidden" aria-hidden />
      <Moon className="hidden dark:block" aria-hidden />
    </Button>
  );
}

// 헤더가 없는 화면(로그인·안내·404)의 우측 상단 고정 토글
export function CornerThemeToggle() {
  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
      <ThemeToggle />
    </div>
  );
}
