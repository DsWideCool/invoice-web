"use server";

import { createRateLimiter, formatBlockMessage } from "@/lib/rate-limiter";
import { getRequestIp } from "@/lib/request-ip";
import {
  createReport,
  isReportFeatureEnabled,
  lookupReport,
} from "@/lib/services/report.service";
import {
  reportCreateSchema,
  reportLookupSchema,
  type ReportCreateInput,
  type ReportLookupInput,
} from "@/lib/validations/report";
import type { Report } from "@/types/report";

export type ReportActionResult =
  { ok: true; report: Report } | { ok: false; error: string };

// 신고 남발 방지: IP당 10분에 5건
const createLimiter = createRateLimiter({ max: 5, windowMs: 10 * 60_000 });
// 조회 비밀번호 무차별 대입 방지: IP당 10분에 10회 실패
const lookupLimiter = createRateLimiter({ max: 10, windowMs: 10 * 60_000 });

const NOT_CONFIGURED_ERROR = "신고 기능이 아직 준비되지 않았습니다.";
const UNKNOWN_ERROR =
  "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

// 신고 작성 (상태: 작성)
export async function createReportAction(
  input: ReportCreateInput,
): Promise<ReportActionResult> {
  if (!isReportFeatureEnabled())
    return { ok: false, error: NOT_CONFIGURED_ERROR };

  const parsed = reportCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    };
  }

  const ip = await getRequestIp();
  const blockSeconds = createLimiter.getBlockSeconds(ip);
  if (blockSeconds !== null) {
    return { ok: false, error: formatBlockMessage(blockSeconds) };
  }
  createLimiter.record(ip);

  try {
    const { title, content, password } = parsed.data;
    const report = await createReport({ title, content, password });
    return { ok: true, report };
  } catch (error) {
    console.error(error);
    return { ok: false, error: UNKNOWN_ERROR };
  }
}

// 신고 번호 + 조회 비밀번호로 내 신고 조회
export async function lookupReportAction(
  input: ReportLookupInput,
): Promise<ReportActionResult> {
  if (!isReportFeatureEnabled())
    return { ok: false, error: NOT_CONFIGURED_ERROR };

  const parsed = reportLookupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    };
  }

  const ip = await getRequestIp();
  const blockSeconds = lookupLimiter.getBlockSeconds(ip);
  if (blockSeconds !== null) {
    return { ok: false, error: formatBlockMessage(blockSeconds) };
  }

  try {
    const report = await lookupReport(
      parsed.data.reportNumber,
      parsed.data.password,
    );
    if (!report) {
      lookupLimiter.record(ip);
      return {
        ok: false,
        error: "신고 번호 또는 조회 비밀번호가 올바르지 않습니다.",
      };
    }
    return { ok: true, report };
  } catch (error) {
    console.error(error);
    return { ok: false, error: UNKNOWN_ERROR };
  }
}
