"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Inbox, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  acceptReportAction,
  answerReportAction,
} from "@/app/(admin)/admin/(dashboard)/reports/actions";
import { FormField, getFieldAria } from "@/components/report/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_TEXT_MAX_LENGTH,
  reportAnswerSchema,
  type ReportAnswerInput,
} from "@/lib/validations/report";
import type { Report } from "@/types/report";

// 작성 상태: "접수" 버튼
function AcceptPanel({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptReportAction(reportId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("신고를 접수했습니다");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>신고 접수</CardTitle>
        <CardDescription>
          접수하면 신고자에게 &lsquo;접수&rsquo; 상태로 표시되고 답변을 작성할
          수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAccept} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Inbox />}
          접수
        </Button>
      </CardContent>
    </Card>
  );
}

// 접수·처리완료 상태: 답변 작성(수정) 폼
function AnswerPanel({ report }: { report: Report }) {
  const router = useRouter();
  const isEditing = report.status === "처리완료";
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportAnswerInput>({
    resolver: zodResolver(reportAnswerSchema),
    defaultValues: { answer: report.answer },
  });

  const answerLength = watch("answer").length;

  const onSubmit = async (values: ReportAnswerInput) => {
    const result = await answerReportAction(report.id, values);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      isEditing ? "답변을 수정했습니다" : "답변을 등록하고 처리완료했습니다",
    );
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "답변 수정" : "답변 작성"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "수정한 답변은 신고자 화면에 바로 반영됩니다."
            : "답변을 등록하면 상태가 '처리완료'로 바뀝니다."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <FormField
            id="answer"
            label="답변"
            error={errors.answer?.message}
            description={`${answerLength} / ${REPORT_TEXT_MAX_LENGTH}자`}
          >
            <Textarea
              {...getFieldAria("answer", errors.answer?.message)}
              rows={6}
              maxLength={REPORT_TEXT_MAX_LENGTH}
              placeholder="신고자에게 보낼 답변을 입력해 주세요."
              {...register("answer")}
            />
          </FormField>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto sm:self-end"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
            {isEditing ? "답변 수정" : "답변 등록 (처리완료)"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// 신고 상태에 맞는 관리자 처리 패널
export function ReportAdminPanel({ report }: { report: Report }) {
  return report.status === "작성" ? (
    <AcceptPanel reportId={report.id} />
  ) : (
    <AnswerPanel report={report} />
  );
}
