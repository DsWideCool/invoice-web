"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { lookupReportAction } from "@/app/report/actions";
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
import {
  reportLookupSchema,
  type ReportLookupInput,
} from "@/lib/validations/report";
import type { Report } from "@/types/report";

interface ReportLookupProps {
  // 신고 완료 화면에서 넘어온 신고 번호
  defaultNumber?: string;
}

// 신고 번호 + 조회 비밀번호로 내 신고의 상태·답변 확인
export function ReportLookup({ defaultNumber = "" }: ReportLookupProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReportLookupInput>({
    resolver: zodResolver(reportLookupSchema),
    defaultValues: { reportNumber: defaultNumber, password: "" },
  });

  const onSubmit = async (values: ReportLookupInput) => {
    setServerError(null);
    const result = await lookupReportAction(values);
    if (!result.ok) {
      setReport(null);
      setServerError(result.error);
      return;
    }
    setReport(result.report);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>내 신고 조회</CardTitle>
          <CardDescription>
            신고할 때 받은 신고 번호와 직접 정한 조회 비밀번호를 입력해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 sm:flex-row sm:items-start"
            noValidate
          >
            <div className="flex-1">
              <FormField
                id="reportNumber"
                label="신고 번호"
                error={errors.reportNumber?.message}
              >
                <Input
                  {...getFieldAria(
                    "reportNumber",
                    errors.reportNumber?.message,
                  )}
                  placeholder="RPT-261123-K7QF"
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="font-mono uppercase"
                  {...register("reportNumber")}
                />
              </FormField>
            </div>
            <div className="flex-1">
              <FormField
                id="lookupPassword"
                label="조회 비밀번호"
                error={errors.password?.message}
              >
                <Input
                  {...getFieldAria("lookupPassword", errors.password?.message)}
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </FormField>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:mt-[1.375rem]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Search />}
              조회
            </Button>
          </form>
          {serverError && (
            <p role="alert" className="text-destructive mt-4 text-sm">
              {serverError}
            </p>
          )}
        </CardContent>
      </Card>

      {report && (
        <ReportDetail
          report={report}
          emptyAnswerMessage={
            report.status === "작성"
              ? "관리자가 아직 신고를 확인하지 않았습니다."
              : "신고가 접수되어 처리 중입니다. 답변이 등록되면 이곳에 표시됩니다."
          }
        />
      )}
    </div>
  );
}
