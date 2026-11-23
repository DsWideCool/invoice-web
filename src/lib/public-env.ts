import { z } from "zod";

// 클라이언트에 공개되는 환경 변수 스키마 (NEXT_PUBLIC_ 접두사만)
const publicEnvSchema = z.object({
  // 클라이언트에게 전달할 견적서 링크의 기준 도메인 (예: https://invoice.example.com)
  NEXT_PUBLIC_APP_URL: z
    .url({ protocol: /^https?$/ })
    .optional()
    .catch(undefined),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

// NEXT_PUBLIC_ 변수는 빌드 시 문자열로 치환되므로 반드시 리터럴로 참조
export const publicEnv: PublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});
