import "server-only";

import { randomInt } from "node:crypto";

import {
  APIErrorCode,
  isFullPage,
  isNotionClientError,
} from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { revalidateTag, unstable_cache } from "next/cache";

import { hashPassword, verifyPasswordHash } from "@/lib/auth/password-hash";
import { getReportDatabaseId } from "@/lib/env";
import { maskName } from "@/lib/mask";
import { getNotionClient } from "@/lib/notion/client";
import { getDate, getStatusName, getText } from "@/lib/notion/properties";
import { withRateLimitRetry } from "@/lib/notion/retry";
import { normalizeNotionId } from "@/lib/services/invoice.service";
import {
  REPORT_STATUSES,
  type PublicReportItem,
  type Report,
  type ReportStatus,
  type ReportSummary,
} from "@/types/report";

// Notion 신고 DB 속성 이름 (scripts/setup-report-db.mjs와 일치해야 함)
export const REPORT_PROPS = {
  title: "제목",
  number: "신고 번호",
  author: "작성자",
  content: "내용",
  status: "상태",
  answer: "답변",
  answeredAt: "답변일",
  passwordHash: "조회 비밀번호 해시",
} as const;

// 신고 목록 캐시 (작성·접수·답변 시 태그로 즉시 무효화)
const REPORT_CACHE_TAG = "reports";
const REPORT_CACHE_SECONDS = 30;

// 관리용 번호 랜덤부: 헷갈리는 문자(0·O·1·I) 제외
const NUMBER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export class ReportNotConfiguredError extends Error {
  constructor() {
    super("NOTION_REPORT_DATABASE_ID가 설정되지 않았습니다.");
  }
}

// 상태 전환 규칙 위반 등 사용자에게 보여줄 수 있는 오류
export class ReportActionError extends Error {}

function getDatabaseIdOrThrow(): string {
  const id = getReportDatabaseId();
  if (!id) throw new ReportNotConfiguredError();
  return id;
}

export function isReportFeatureEnabled(): boolean {
  return getReportDatabaseId() !== null;
}

function isReportStatus(value: string | null): value is ReportStatus {
  return REPORT_STATUSES.some((status) => status === value);
}

function richText(content: string) {
  return [{ type: "text" as const, text: { content } }];
}

function toReport(page: PageObjectResponse): Report {
  const props = page.properties;
  const status = getStatusName(props, REPORT_PROPS.status);

  return {
    id: page.id,
    reportNumber: getText(props, REPORT_PROPS.number),
    title: getText(props, REPORT_PROPS.title),
    author: getText(props, REPORT_PROPS.author),
    // 상태가 비어 있으면 갓 작성된 신고로 취급
    status: isReportStatus(status) ? status : "작성",
    createdAt: page.created_time,
    answeredAt: getDate(props, REPORT_PROPS.answeredAt),
    content: getText(props, REPORT_PROPS.content),
    answer: getText(props, REPORT_PROPS.answer),
  };
}

function toSummary(report: Report): ReportSummary {
  return {
    id: report.id,
    reportNumber: report.reportNumber,
    title: report.title,
    author: report.author,
    status: report.status,
    createdAt: report.createdAt,
    answeredAt: report.answeredAt,
  };
}

// 관리용 번호 생성: RPT-YYMMDD(한국 시간)-XXXX
function generateReportNumber(): string {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/-/g, "");
  const suffix = Array.from(
    { length: 4 },
    () => NUMBER_ALPHABET[randomInt(NUMBER_ALPHABET.length)],
  ).join("");
  return `RPT-${date}-${suffix}`;
}

async function isReportNumberTaken(reportNumber: string): Promise<boolean> {
  const response = await withRateLimitRetry(() =>
    getNotionClient().databases.query({
      database_id: getDatabaseIdOrThrow(),
      filter: {
        property: REPORT_PROPS.number,
        rich_text: { equals: reportNumber },
      },
      page_size: 1,
    }),
  );
  return response.results.length > 0;
}

// 신고 목록 캐시 무효화 (작성·접수·답변 후 호출)
function invalidateReports(): void {
  revalidateTag(REPORT_CACHE_TAG);
}

// 신고 작성 (상태: 작성) — 조회 비밀번호는 해시로만 저장
export async function createReport(input: {
  author: string;
  title: string;
  content: string;
  password: string;
}): Promise<Report> {
  const databaseId = getDatabaseIdOrThrow();

  // 번호 충돌 시 최대 3번 다시 생성
  let reportNumber = generateReportNumber();
  for (let i = 0; i < 3 && (await isReportNumberTaken(reportNumber)); i++) {
    reportNumber = generateReportNumber();
  }

  const page = await withRateLimitRetry(() =>
    getNotionClient().pages.create({
      parent: { database_id: databaseId },
      properties: {
        [REPORT_PROPS.title]: { title: richText(input.title) },
        [REPORT_PROPS.number]: { rich_text: richText(reportNumber) },
        [REPORT_PROPS.author]: { rich_text: richText(input.author) },
        [REPORT_PROPS.content]: { rich_text: richText(input.content) },
        [REPORT_PROPS.status]: { select: { name: "작성" } },
        [REPORT_PROPS.passwordHash]: {
          rich_text: richText(hashPassword(input.password)),
        },
      },
    }),
  );
  if (!isFullPage(page)) throw new Error("신고를 저장하지 못했습니다.");
  invalidateReports();
  return toReport(page);
}

// 신고 DB 전체 조회 (최신순)
async function fetchReports(): Promise<ReportSummary[]> {
  const databaseId = getDatabaseIdOrThrow();
  const reports: ReportSummary[] = [];
  let cursor: string | undefined;

  do {
    const response = await withRateLimitRetry(() =>
      getNotionClient().databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        page_size: 100,
        sorts: [{ timestamp: "created_time", direction: "descending" }],
      }),
    );
    for (const result of response.results) {
      if (isFullPage(result)) reports.push(toSummary(toReport(result)));
    }
    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return reports;
}

const getCachedReports = unstable_cache(fetchReports, ["report-list"], {
  revalidate: REPORT_CACHE_SECONDS,
  tags: [REPORT_CACHE_TAG],
});

// 관리자: 전체 신고 목록 (최신순, 작성자 실명 포함)
export async function listReports(): Promise<ReportSummary[]> {
  return getCachedReports();
}

// 공개 게시판: 작성자 이름을 가린 목록 (최신순, 순번은 오래된 글이 1번)
export async function listPublicReports(): Promise<PublicReportItem[]> {
  const reports = await getCachedReports();
  return reports.map((report, index) => ({
    id: report.id,
    seq: reports.length - index,
    title: report.title,
    maskedAuthor: maskName(report.author),
    status: report.status,
    createdAt: report.createdAt,
  }));
}

// 신고 페이지 조회 (신고 DB 소속 페이지만 허용, 해시 포함 원본)
async function retrieveReportPage(
  id: string,
): Promise<PageObjectResponse | null> {
  const pageId = normalizeNotionId(id);
  if (!pageId) return null;
  const databaseId = getDatabaseIdOrThrow();

  try {
    const page = await withRateLimitRetry(() =>
      getNotionClient().pages.retrieve({ page_id: pageId }),
    );
    if (!isFullPage(page) || page.parent.type !== "database_id") return null;
    const parentId = normalizeNotionId(page.parent.database_id);
    if (parentId !== normalizeNotionId(databaseId)) return null;
    return page;
  } catch (error) {
    if (
      isNotionClientError(error) &&
      (error.code === APIErrorCode.ObjectNotFound ||
        error.code === APIErrorCode.ValidationError)
    ) {
      return null;
    }
    throw error;
  }
}

// 관리자: 신고 상세
export async function getReport(id: string): Promise<Report | null> {
  const page = await retrieveReportPage(id);
  return page ? toReport(page) : null;
}

// 공개 게시판: 비밀번호 입력 전 보여줄 글 정보 (내용·답변·실명 제외)
export async function getPublicReportItem(
  id: string,
): Promise<Omit<PublicReportItem, "seq"> | null> {
  const page = await retrieveReportPage(id);
  if (!page) return null;
  const report = toReport(page);
  return {
    id: report.id,
    title: report.title,
    maskedAuthor: maskName(report.author),
    status: report.status,
    createdAt: report.createdAt,
  };
}

// 존재하지 않는 신고 조회 시 비교용 더미 해시 (처음 필요할 때 1회 생성)
let dummyHash: string | null = null;
function getDummyHash(): string {
  dummyHash ??= hashPassword("dummy-password-for-timing");
  return dummyHash;
}

// 공개 게시판: 조회 비밀번호가 맞으면 신고 상세 반환 (불일치 시 null)
export async function unlockReport(
  id: string,
  password: string,
): Promise<Report | null> {
  const page = await retrieveReportPage(id);
  const stored = page
    ? getText(page.properties, REPORT_PROPS.passwordHash)
    : "";
  // 신고가 없어도 해시 검증 시간을 비슷하게 맞춤
  const matched = verifyPasswordHash(password, stored || getDummyHash());
  return page && stored && matched ? toReport(page) : null;
}

async function getReportOrThrow(id: string): Promise<Report> {
  const report = await getReport(id);
  if (!report) throw new ReportActionError("신고를 찾을 수 없습니다.");
  return report;
}

// 관리자: 접수 처리 (작성 → 접수)
export async function acceptReport(id: string): Promise<void> {
  const report = await getReportOrThrow(id);
  if (report.status !== "작성") {
    throw new ReportActionError("이미 접수된 신고입니다.");
  }
  await withRateLimitRetry(() =>
    getNotionClient().pages.update({
      page_id: report.id,
      properties: { [REPORT_PROPS.status]: { select: { name: "접수" } } },
    }),
  );
  invalidateReports();
}

// 관리자: 답변 등록·수정 (접수/처리완료 → 처리완료)
export async function answerReport(id: string, answer: string): Promise<void> {
  const report = await getReportOrThrow(id);
  if (report.status === "작성") {
    throw new ReportActionError("먼저 신고를 접수해 주세요.");
  }
  await withRateLimitRetry(() =>
    getNotionClient().pages.update({
      page_id: report.id,
      properties: {
        [REPORT_PROPS.answer]: { rich_text: richText(answer) },
        [REPORT_PROPS.status]: { select: { name: "처리완료" } },
        [REPORT_PROPS.answeredAt]: {
          date: { start: new Date().toISOString() },
        },
      },
    }),
  );
  invalidateReports();
}
