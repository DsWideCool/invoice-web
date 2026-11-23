import "server-only";

import { z } from "zod";

// 서버 전용 환경 변수 스키마
const envSchema = z.object({
  NOTION_API_KEY: z.string().min(1, "NOTION_API_KEY가 설정되지 않았습니다."),
  NOTION_DATABASE_ID: z
    .string()
    .min(1, "NOTION_DATABASE_ID가 설정되지 않았습니다."),
  // 견적서 목록(홈) 접근용 관리자 비밀번호 (없으면 목록 기능 비활성화)
  ADMIN_PASSWORD: z.string().optional(),
});

// 관리자 비밀번호 최소 길이
export const MIN_ADMIN_PASSWORD_LENGTH = 8;

// 사용 가능한 관리자 비밀번호를 반환 (미설정 또는 너무 짧으면 null)
export function getAdminPassword(): string | null {
  const password = getServerEnv().ADMIN_PASSWORD?.trim();
  if (!password || password.length < MIN_ADMIN_PASSWORD_LENGTH) return null;
  return password;
}

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
