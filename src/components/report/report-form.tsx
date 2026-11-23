"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createReportAction } from "@/app/report/actions";
import { FormField, getFieldAria } from "@/components/report/form-field";
import { ReportDetail } from "@/components/report/report-detail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_TEXT_MAX_LENGTH,
  reportCreateSchema,
  type ReportCreateInput,
} from "@/lib/validations/report";
import { withReturnPath } from "@/lib/return-path";
import type { Report } from "@/types/report";

// 신고 완료 화면: 신고 번호 안내 + 내가 작성한 내용
function ReportSubmitted({
  report,
  returnPath,
}: {
  report: Report;
  returnPath: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-emerald-500/40">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2
            className="size-10 text-emerald-600 dark:text-emerald-400"
            aria-hidden
          />
          <h2 className="text-lg font-semibold">신고가 등록되었습니다</h2>
          <p className="text-muted-foreground text-sm">
            아래 신고 번호와 입력한 조회 비밀번호로 처리 상태와 답변을 확인할 수
            있습니다. 신고 번호를 꼭 기록해 두세요.
          </p>
          <p
            className="bg-muted rounded-lg px-4 py-2 font-mono text-lg font-semibold tracking-wider select-all"
            aria-label="신고 번호"
          >
            {report.reportNumber}
          </p>
          <Button asChild variant="outline">
            <Link
              href={withReturnPath(
                `/report/lookup?number=${encodeURIComponent(report.reportNumber)}`,
                returnPath,
              )}
            >
              내 신고 조회로 이동
            </Link>
          </Button>
        </CardContent>
      </Card>
      <ReportDetail
        report={report}
        emptyAnswerMessage="관리자가 신고를 확인하면 이곳에 답변이 표시됩니다."
      />
    </div>
  );
}

// 신고 작성 폼 (제목·내용·조회 비밀번호)
interface ReportFormProps {
  // 신고 후 돌아갈 견적서·이용 안내 경로 (검증된 값)
  returnPath: string | null;
}

export function ReportForm({ returnPath }: ReportFormProps) {
  const [submitted, setSubmitted] = useState<Report | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportCreateInput>({
    resolver: zodResolver(reportCreateSchema),
    defaultValues: {
      title: "",
      content: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const contentLength = watch("content").length;

  const onSubmit = async (values: ReportCreateInput) => {
    setServerError(null);
    const result = await createReportAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setSubmitted(result.report);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return <ReportSubmitted report={submitted} returnPath={returnPath} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>신고 내용 작성</CardTitle>
        <CardDescription>
          불편 사항이나 문제를 알려 주세요. 관리자가 확인 후 답변을 드립니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <FormField id="title" label="제목" error={errors.title?.message}>
            <Input
              {...getFieldAria("title", errors.title?.message)}
              placeholder="예: 견적서 링크가 열리지 않습니다"
              maxLength={100}
              {...register("title")}
            />
          </FormField>

          <FormField
            id="content"
            label="신고 내용"
            error={errors.content?.message}
            description={`${contentLength} / ${REPORT_TEXT_MAX_LENGTH}자`}
          >
            <Textarea
              {...getFieldAria("content", errors.content?.message)}
              rows={8}
              maxLength={REPORT_TEXT_MAX_LENGTH}
              placeholder="언제, 어떤 화면에서, 어떤 문제가 있었는지 적어 주세요."
              {...register("content")}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="password"
              label="조회 비밀번호"
              error={errors.password?.message}
              description="내 신고를 다시 볼 때 사용합니다 (4자 이상)."
            >
              <Input
                {...getFieldAria("password", errors.password?.message)}
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </FormField>
            <FormField
              id="passwordConfirm"
              label="조회 비밀번호 확인"
              error={errors.passwordConfirm?.message}
            >
              <Input
                {...getFieldAria(
                  "passwordConfirm",
                  errors.passwordConfirm?.message,
                )}
                type="password"
                autoComplete="new-password"
                {...register("passwordConfirm")}
              />
            </FormField>
          </div>

          {serverError && (
            <p role="alert" className="text-destructive text-sm">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:self-end"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
            신고 완료
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
