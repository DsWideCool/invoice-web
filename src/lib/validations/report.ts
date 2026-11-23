import { z } from "zod";

// Notion rich_text 한 조각의 최대 길이에 맞춤
export const REPORT_TEXT_MAX_LENGTH = 2000;

const passwordSchema = z
  .string()
  .min(4, "조회 비밀번호는 4자 이상이어야 합니다.")
  .max(64, "조회 비밀번호는 64자 이하여야 합니다.");

// 신고 작성 폼 (클라이언트·서버 공용)
export const reportCreateSchema = z
  .object({
    author: z
      .string()
      .trim()
      .min(2, "작성자 이름을 2자 이상 입력해 주세요.")
      .max(20, "작성자 이름은 20자 이하로 입력해 주세요."),
    title: z
      .string()
      .trim()
      .min(2, "제목을 2자 이상 입력해 주세요.")
      .max(100, "제목은 100자 이하로 입력해 주세요."),
    content: z
      .string()
      .trim()
      .min(10, "신고 내용을 10자 이상 입력해 주세요.")
      .max(
        REPORT_TEXT_MAX_LENGTH,
        `신고 내용은 ${REPORT_TEXT_MAX_LENGTH}자 이하로 입력해 주세요.`,
      ),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "조회 비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

export type ReportCreateInput = z.infer<typeof reportCreateSchema>;

// 신고 글 열기 (게시판에서 글 선택 후 조회 비밀번호 입력)
export const reportUnlockSchema = z.object({
  password: z.string().min(1, "조회 비밀번호를 입력해 주세요."),
});

export type ReportUnlockInput = z.infer<typeof reportUnlockSchema>;

// 관리자 답변 폼
export const reportAnswerSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(1, "답변을 입력해 주세요.")
    .max(
      REPORT_TEXT_MAX_LENGTH,
      `답변은 ${REPORT_TEXT_MAX_LENGTH}자 이하로 입력해 주세요.`,
    ),
});

export type ReportAnswerInput = z.infer<typeof reportAnswerSchema>;
