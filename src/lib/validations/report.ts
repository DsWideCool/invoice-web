import { z } from "zod";

// Notion rich_text 한 조각의 최대 길이에 맞춤
export const REPORT_TEXT_MAX_LENGTH = 2000;

// 신고 번호 형식: RPT-YYMMDD-XXXX
export const REPORT_NUMBER_PATTERN = /^RPT-\d{6}-[A-Z0-9]{4}$/;

const passwordSchema = z
  .string()
  .min(4, "조회 비밀번호는 4자 이상이어야 합니다.")
  .max(64, "조회 비밀번호는 64자 이하여야 합니다.");

// 신고 작성 폼 (클라이언트·서버 공용)
export const reportCreateSchema = z
  .object({
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

// 내 신고 조회 폼
export const reportLookupSchema = z.object({
  reportNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      REPORT_NUMBER_PATTERN,
      "신고 번호 형식을 확인해 주세요. (예: RPT-261123-K7QF)",
    ),
  password: z.string().min(1, "조회 비밀번호를 입력해 주세요."),
});

export type ReportLookupInput = z.input<typeof reportLookupSchema>;

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
