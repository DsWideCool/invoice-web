import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/types/report";

// 상태별 색상: 작성(대기) · 접수(진행 중) · 처리완료
const STATUS_STYLES: Record<ReportStatus, string> = {
  작성: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  접수: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  처리완료:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function ReportStatusBadge({
  status,
  className,
}: ReportStatusBadgeProps) {
  return (
    <Badge className={cn(STATUS_STYLES[status], className)}>{status}</Badge>
  );
}
