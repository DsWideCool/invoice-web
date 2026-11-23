"use server";

import { isAdminAuthenticated } from "@/lib/auth/session";
import {
  acceptReport,
  answerReport,
  ReportActionError,
} from "@/lib/services/report.service";
import {
  reportAnswerSchema,
  type ReportAnswerInput,
} from "@/lib/validations/report";

export interface AdminReportActionResult {
  error?: string;
}

// 관리자 확인 + 공통 오류 처리
async function runAdminAction(
  action: () => Promise<void>,
): Promise<AdminReportActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: "로그인이 필요합니다." };
  }
  try {
    await action();
    return {};
  } catch (error) {
    if (error instanceof ReportActionError) return { error: error.message };
    console.error(error);
    return { error: "처리하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

// 접수 처리 (작성 → 접수)
export async function acceptReportAction(
  id: string,
): Promise<AdminReportActionResult> {
  return runAdminAction(() => acceptReport(id));
}

// 답변 등록 (접수 → 처리완료, 처리완료 상태에서는 답변 수정)
export async function answerReportAction(
  id: string,
  input: ReportAnswerInput,
): Promise<AdminReportActionResult> {
  const parsed = reportAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "답변을 확인해 주세요.",
    };
  }
  return runAdminAction(() => answerReport(id, parsed.data.answer));
}
