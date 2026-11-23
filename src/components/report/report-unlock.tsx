"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, LockOpen } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { unlockReportAction } from "@/app/report/actions";
import { FormField, getFieldAria } from "@/components/report/form-field";
import { ReportDetail } from "@/components/report/report-detail";
import { ReportStatusBadge } from "@/components/report/report-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import {
  reportUnlockSchema,
  type ReportUnlockInput,
} from "@/lib/validations/report";
import type { PublicReportItem, Report } from "@/types/report";

interface ReportUnlockProps {
  // 비밀번호 입력 전 공개 정보 (작성자는 가린 이름)
  item: Omit<PublicReportItem, "seq">;
}

// 비밀글 열기: 조회 비밀번호가 맞으면 내용·답변 표시
export function ReportUnlock({ item }: ReportUnlockProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportUnlockInput>({
    resolver: zodResolver(reportUnlockSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: ReportUnlockInput) => {
    setServerError(null);
    const result = await unlockReportAction(item.id, values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setReport(result.report);
  };

  if (report) {
    return (
      <ReportDetail
        report={report}
        emptyAnswerMessage={
          report.status === "작성"
            ? "관리자가 아직 신고를 확인하지 않았습니다."
            : "신고가 접수되어 처리 중입니다. 답변이 등록되면 이곳에 표시됩니다."
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">
            작성자 {item.maskedAuthor} · {formatDate(item.createdAt)}
          </span>
          <ReportStatusBadge status={item.status} />
        </div>
        <CardTitle className="flex items-center gap-2 text-lg break-words sm:text-xl">
          <Lock className="text-muted-foreground size-4 shrink-0" aria-hidden />
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <p className="text-muted-foreground text-sm">
            비밀글입니다. 신고할 때 정한 조회 비밀번호를 입력해 주세요.
          </p>
          <FormField
            id="unlockPassword"
            label="조회 비밀번호"
            error={errors.password?.message ?? serverError ?? undefined}
          >
            <Input
              {...getFieldAria(
                "unlockPassword",
                errors.password?.message ?? serverError ?? undefined,
              )}
              type="password"
              autoComplete="current-password"
              autoFocus
              {...register("password")}
            />
          </FormField>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:self-end"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <LockOpen />}
            확인
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
