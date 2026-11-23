"use server";

import { createRateLimiter, formatBlockMessage } from "@/lib/rate-limiter";
import { getRequestIp } from "@/lib/request-ip";
import {
  createReport,
  isReportFeatureEnabled,
  unlockReport,
} from "@/lib/services/report.service";
import {
  reportCreateSchema,
  reportUnlockSchema,
  type ReportCreateInput,
  type ReportUnlockInput,
} from "@/lib/validations/report";
import type { Report } from "@/types/report";

export type ReportActionResult =
  { ok: true; report: Report } | { ok: false; error: string };

// 신고 남발 방지: IP당 10분에 5건
const createLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60_000 });
// 조회 비밀번호 무차별 대입 방지: IP당 10분에 10회 실패
const unlockLimiter = createRateLimiter({ max: 10, windowMs: 10 * 60_000 });

const NOT_CONFIGURED_ERROR = "신고 기능이 아직 준비되지 않았습니다.";
const UNKNOWN_ERROR =
  "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

function firstIssue(issues: { message: string }[]): string {
  return issues[0]?.message ?? "입력값을 확인해 주세요.";
}

// 신고 작성 (상태: 작성)
export async function createReportAction(
  input: ReportCreateInput,
): Promise<ReportActionResult> {
  if (!isReportFeatureEnabled()) {
    return { ok: false, error: NOT_CONFIGURED_ERROR };
  }

  const parsed = reportCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error.issues) };
  }

  const ip = await getRequestIp();
  const blockSeconds = createLimiter.getBlockSeconds(ip);
  if (blockSeconds !== null) {
    return { ok: false, error: formatBlockMessage(blockSeconds) };
  }
  createLimiter.record(ip);

  try {
    const { author, title, content, password } = parsed.data;
    const report = await createReport({ author, title, content, password });
    return { ok: true, report };
  } catch (error) {
    console.error(error);
    return { ok: false, error: UNKNOWN_ERROR };
  }
}

// 게시판에서 선택한 신고를 조회 비밀번호로 열기
export async function unlockReportAction(
  id: string,
  input: ReportUnlockInput,
): Promise<ReportActionResult> {
  if (!isReportFeatureEnabled()) {
    return { ok: false, error: NOT_CONFIGURED_ERROR };
  }

  const parsed = reportUnlockSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error.issues) };
  }

  const ip = await getRequestIp();
  const blockSeconds = unlockLimiter.getBlockSeconds(ip);
  if (blockSeconds !== null) {
    return { ok: false, error: formatBlockMessage(blockSeconds) };
  }

  try {
    const report = await unlockReport(id, parsed.data.password);
    if (!report) {
      unlockLimiter.record(ip);
      return { ok: false, error: "조회 비밀번호가 올바르지 않습니다." };
    }
    return { ok: true, report };
  } catch (error) {
    console.error(error);
    return { ok: false, error: UNKNOWN_ERROR };
  }
}
