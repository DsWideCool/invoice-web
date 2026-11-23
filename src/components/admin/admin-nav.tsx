"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 관리자 메뉴 (메뉴가 늘어나면 여기에 추가)
const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "견적서 목록",
    match: (path: string) => path === "/admin",
  },
  {
    href: "/admin/reports",
    label: "신고 관리",
    match: (path: string) => path.startsWith("/admin/reports"),
  },
] as const;

// 현재 경로를 강조하는 관리자 메뉴
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="관리자 메뉴" className="flex items-center gap-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.match(pathname);
        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            size="sm"
            className={cn(isActive && "bg-muted font-semibold")}
          >
            <Link href={item.href} aria-current={isActive ? "page" : undefined}>
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
