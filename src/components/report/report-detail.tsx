import { CheckCircle2, Clock, Inbox } from "lucide-react";

import { ReportStatusBadge } from "@/components/report/report-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  REPORT_STATUSES,
  type Report,
  type ReportStatus,
} from "@/types/report";

const STEP_ICONS: Record<ReportStatus, typeof Clock> = {
  작성: Clock,
  접수: Inbox,
  처리완료: CheckCircle2,
};

// 작성 → 접수 → 처리완료 진행 단계 표시
function ReportProgress({ status }: { status: ReportStatus }) {
  const currentIndex = REPORT_STATUSES.indexOf(status);

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="처리 단계">
      {REPORT_STATUSES.map((step, index) => {
        const Icon = STEP_ICONS[step];
        const isDone = index <= currentIndex;
        return (
          <li
            key={step}
            aria-current={index === currentIndex ? "step" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs sm:text-sm",
              isDone
                ? "border-primary/40 bg-primary/5 text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {step}
          </li>
        );
      })}
    </ol>
  );
}

interface ReportDetailProps {
  report: Report;
  // 답변이 없을 때 보여줄 안내 (신고자 화면/관리자 화면에 따라 다름)
  emptyAnswerMessage?: string;
}

// 신고 상세 카드: 번호·상태·진행 단계·내용·답변
export function ReportDetail({
  report,
  emptyAnswerMessage = "아직 답변이 등록되지 않았습니다.",
}: ReportDetailProps) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground font-mono text-sm">
            {report.reportNumber}
          </span>
          <ReportStatusBadge status={report.status} />
        </div>
        <CardTitle className="text-lg break-words sm:text-xl">
          {report.title}
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          작성 {formatDateTime(report.createdAt)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ReportProgress status={report.status} />

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">신고 내용</h3>
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {report.content}
          </p>
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">관리자 답변</h3>
            {report.answeredAt && (
              <span className="text-muted-foreground text-xs">
                {formatDateTime(report.answeredAt)}
              </span>
            )}
          </div>
          {report.answer ? (
            <p className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {report.answer}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              {emptyAnswerMessage}
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
