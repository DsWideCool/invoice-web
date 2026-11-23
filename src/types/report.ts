// 신고 처리 상태: 작성(신고 접수 전) → 접수(관리자 확인) → 처리완료(답변 등록)
// Notion 신고 DB `상태` Select 속성 옵션과 동일
export const REPORT_STATUSES = ["작성", "접수", "처리완료"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

// 목록용 요약 정보
export interface ReportSummary {
  id: string;
  // 신고자에게 안내하는 조회용 번호 (예: RPT-261123-K7QF)
  reportNumber: string;
  title: string;
  status: ReportStatus;
  createdAt: string;
  answeredAt: string | null;
}

// 상세 정보 (조회 비밀번호 해시는 서버 밖으로 내보내지 않음)
export interface Report extends ReportSummary {
  content: string;
  answer: string;
}
