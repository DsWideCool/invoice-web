"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearLoginFailures,
  getLoginBlockSeconds,
  recordLoginFailure,
} from "@/lib/auth/login-rate-limit";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/constants";
import {
  createAdminSession,
  deleteAdminSession,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/auth/session";
import { INVOICE_CACHE_TAG } from "@/lib/services/invoice.service";
import { getRequestIp } from "@/lib/request-ip";
import { loginSchema, type LoginInput } from "@/lib/validations/login";

export interface ActionResult {
  error?: string;
}

// 관리자 로그인
export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.",
    };
  }

  const ip = await getRequestIp();
  const blockSeconds = getLoginBlockSeconds(ip);
  if (blockSeconds !== null) {
    const minutes = Math.ceil(blockSeconds / 60);
    return {
      error: `로그인 시도가 너무 많습니다. ${minutes}분 후 다시 시도해 주세요.`,
    };
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    recordLoginFailure(ip);
    return { error: "비밀번호가 올바르지 않습니다." };
  }

  clearLoginFailures(ip);
  await createAdminSession();
  return {};
}

// 관리자 로그아웃 후 로그인 화면으로 이동
export async function logoutAction(): Promise<void> {
  await deleteAdminSession();
  redirect(ADMIN_LOGIN_PATH);
}

// Notion 캐시를 비워 최신 견적서를 즉시 다시 조회
export async function refreshInvoicesAction(): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) {
    return { error: "로그인이 필요합니다." };
  }
  revalidateTag(INVOICE_CACHE_TAG);
  return {};
}
