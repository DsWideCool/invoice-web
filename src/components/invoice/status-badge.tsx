import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/invoice";

// 상태별 색상 (Notion 옵션 색상과 비슷하게 맞춤)
const STATUS_STYLES: Record<InvoiceStatus, string> = {
  대기: "bg-muted text-muted-foreground",
  승인: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  거절: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

interface StatusBadgeProps {
  status: InvoiceStatus | null;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) return null;

  return (
    <Badge className={cn(STATUS_STYLES[status], className)}>{status}</Badge>
  );
}
