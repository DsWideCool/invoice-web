import "server-only";

import { z } from "zod";

import { isPasswordHash } from "@/lib/auth/password-hash";

// 서버 전용 환경 변수 스키마
const envSchema = z.object({
  NOTION_API_KEY: z.string().min(1, "NOTION_API_KEY가 설정되지 않았습니다."),
  NOTION_DATABASE_ID: z
    .string()
    .min(1, "NOTION_DATABASE_ID가 설정되지 않았습니다."),
  // 신고 저장용 Notion DB (없으면 신고 기능 비활성화)
  NOTION_REPORT_DATABASE_ID: z.string().optional(),
  // 관리자 비밀번호 해시 (배포용 권장, `npm run hash-password`로 생성)
  ADMIN_PASSWORD_HASH: z.string().optional(),
  // 로그인 세션 쿠키 서명 키 (해시 방식에서는 필수)
  SESSION_SECRET: z.string().optional(),
  // 관리자 평문 비밀번호 (로컬 개발용, 해시가 있으면 무시)
  ADMIN_PASSWORD: z.string().optional(),
});

// 관리자 평문 비밀번호·세션 서명 키 최소 길이
export const MIN_ADMIN_PASSWORD_LENGTH = 8;
export const MIN_SESSION_SECRET_LENGTH = 32;

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

// 최초 호출 시 검증하고 이후에는 캐시된 값을 반환
export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message);
    throw new Error(`환경 변수 설정 오류: ${messages.join(" ")}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

// 관리자 인증 방식: 해시(배포 권장) 또는 평문(로컬 개발용)
export type AdminCredential =
  { type: "hash"; hash: string } | { type: "password"; password: string };

export interface AdminAuthConfig {
  credential: AdminCredential;
  // 세션 쿠키 HMAC 서명 키 (비밀번호가 바뀌면 키도 바뀌어 기존 세션이 무효화됨)
  signingKey: string;
}

// 사용 가능한 관리자 인증 설정을 반환 (설정이 없거나 불완전하면 null)
export function getAdminAuthConfig(): AdminAuthConfig | null {
  const env = getServerEnv();
  const secret = env.SESSION_SECRET?.trim();
  const hasSecret = Boolean(
    secret && secret.length >= MIN_SESSION_SECRET_LENGTH,
  );

  // 1순위: 해시 + 세션 서명 키 (해시만으로는 쿠키 위조를 막을 수 없으므로 둘 다 필요)
  const hash = env.ADMIN_PASSWORD_HASH?.trim();
  if (hash && hasSecret && isPasswordHash(hash)) {
    return {
      credential: { type: "hash", hash },
      signingKey: `${secret}:${hash}`,
    };
  }

  // 2순위: 평문 비밀번호 (로컬 개발용)
  const password = env.ADMIN_PASSWORD?.trim();
  if (password && password.length >= MIN_ADMIN_PASSWORD_LENGTH) {
    return {
      credential: { type: "password", password },
      signingKey: hasSecret ? `${secret}:${password}` : password,
    };
  }

  return null;
}

// 신고 DB ID (없으면 null)
export function getReportDatabaseId(): string | null {
  return getServerEnv().NOTION_REPORT_DATABASE_ID?.trim() || null;
}
