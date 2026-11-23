import { z } from "zod";

// 관리자 로그인 폼 스키마 (클라이언트·서버 공용)
export const loginSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
});

export type LoginInput = z.infer<typeof loginSchema>;
