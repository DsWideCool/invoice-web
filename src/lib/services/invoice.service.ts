import "server-only";

import {
  APIErrorCode,
  isFullPage,
  isNotionClientError,
} from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { getServerEnv } from "@/lib/env";
import { getNotionClient } from "@/lib/notion/client";
import { withRateLimitRetry } from "@/lib/notion/retry";
import {
  getDate,
  getNumber,
  getRelationIds,
  getStatusName,
  getText,
} from "@/lib/notion/properties";
import {
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceItem,
  type InvoiceListItem,
  type InvoiceStatus,
} from "@/types/invoice";

// Notion 속성 이름 (Notion 데이터베이스와 정확히 일치해야 함)
const INVOICE_PROPS = {
  number: "견적서 번호",
  clientName: "클라이언트명",
  issueDate: "발행일",
  validUntil: "유효기간",
  status: "상태",
  totalAmount: "총 금액",
  items: "항목",
} as const;

const ITEM_PROPS = {
  name: "항목명",
  quantity: "수량",
  unitPrice: "단가",
  amount: "금액",
} as const;

// Notion API 응답 캐시 시간(초)
const CACHE_SECONDS = 60;

// 견적서 캐시 무효화용 태그 (새로고침 시 사용)
export const INVOICE_CACHE_TAG = "invoices";

// 하이픈 유무와 관계없이 32자리 16진수 ID로 정규화 (형식이 틀리면 null)
export function normalizeNotionId(id: string): string | null {
  const compact = id.replace(/-/g, "").toLowerCase();
  return /^[0-9a-f]{32}$/.test(compact) ? compact : null;
}

function isInvoiceStatus(value: string | null): value is InvoiceStatus {
  return INVOICE_STATUSES.some((status) => status === value);
}

// 존재하지 않거나 접근 권한이 없는 페이지는 null로 처리
async function retrievePage(
  pageId: string,
): Promise<PageObjectResponse | null> {
  try {
    const page = await withRateLimitRetry(() =>
      getNotionClient().pages.retrieve({ page_id: pageId }),
    );
    return isFullPage(page) ? page : null;
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

// relation 항목이 25개를 넘으면 페이지 객체에 일부만 담기므로 속성 API로 전체 조회
async function getAllRelationIds(page: PageObjectResponse): Promise<string[]> {
  const property = page.properties[INVOICE_PROPS.items];
  if (property?.type !== "relation") return [];
  // has_more는 SDK 타입에 없지만 API 응답에는 포함됨
  const hasMore = "has_more" in property && property.has_more === true;
  if (!hasMore) {
    return getRelationIds(page.properties, INVOICE_PROPS.items);
  }

  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const response = await getNotionClient().pages.properties.retrieve({
      page_id: page.id,
      property_id: property.id,
      start_cursor: cursor,
    });
    if (response.object !== "list") break;
    for (const result of response.results) {
      if (result.type === "relation") ids.push(result.relation.id);
    }
    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return ids;
}

function toInvoiceItem(page: PageObjectResponse): InvoiceItem {
  const props = page.properties;
  const quantity = getNumber(props, ITEM_PROPS.quantity) ?? 0;
  const unitPrice = getNumber(props, ITEM_PROPS.unitPrice) ?? 0;

  return {
    id: page.id,
    name: getText(props, ITEM_PROPS.name),
    quantity,
    unitPrice,
    // 수식 값이 없으면 수량 × 단가로 계산
    amount: getNumber(props, ITEM_PROPS.amount) ?? quantity * unitPrice,
  };
}

// 견적서 페이지의 기본 정보(항목 제외)를 변환
function toInvoiceListItem(page: PageObjectResponse): InvoiceListItem {
  const props = page.properties;
  const status = getStatusName(props, INVOICE_PROPS.status);

  return {
    id: page.id,
    invoiceNumber: getText(props, INVOICE_PROPS.number),
    clientName: getText(props, INVOICE_PROPS.clientName),
    issueDate: getDate(props, INVOICE_PROPS.issueDate),
    validUntil: getDate(props, INVOICE_PROPS.validUntil),
    status: isInvoiceStatus(status) ? status : null,
    totalAmount: getNumber(props, INVOICE_PROPS.totalAmount),
  };
}

async function fetchInvoice(invoiceId: string): Promise<Invoice | null> {
  const page = await retrievePage(invoiceId);
  if (!page) return null;

  // 견적서 데이터베이스에 속한 페이지만 허용 (다른 Notion 페이지 노출 방지)
  const databaseId = normalizeNotionId(getServerEnv().NOTION_DATABASE_ID);
  if (
    page.parent.type !== "database_id" ||
    normalizeNotionId(page.parent.database_id) !== databaseId
  ) {
    return null;
  }

  // 견적 항목은 병렬로 조회
  const itemIds = await getAllRelationIds(page);
  const itemPages = await Promise.all(itemIds.map((id) => retrievePage(id)));
  const items = itemPages
    .filter((item): item is PageObjectResponse => item !== null)
    .map(toInvoiceItem);

  const summary = toInvoiceListItem(page);
  const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    ...summary,
    totalAmount: summary.totalAmount ?? itemsTotal,
    items,
  };
}

// 견적서 DB 전체 조회 (최신 발행일 순, 100건 단위 페이지네이션)
async function fetchInvoiceList(): Promise<InvoiceListItem[]> {
  const notion = getNotionClient();
  const databaseId = getServerEnv().NOTION_DATABASE_ID;
  const invoices: InvoiceListItem[] = [];
  let cursor: string | undefined;

  do {
    const response = await withRateLimitRetry(() =>
      notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        page_size: 100,
        sorts: [
          { property: INVOICE_PROPS.issueDate, direction: "descending" },
          { timestamp: "created_time", direction: "descending" },
        ],
      }),
    );
    for (const result of response.results) {
      if (isFullPage(result)) invoices.push(toInvoiceListItem(result));
    }
    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return invoices;
}

// 60초 데이터 캐시 + 같은 요청 내 중복 호출 병합(React cache)
const getCachedInvoice = unstable_cache(fetchInvoice, ["invoice"], {
  revalidate: CACHE_SECONDS,
  tags: [INVOICE_CACHE_TAG],
});

const getCachedInvoiceList = unstable_cache(
  fetchInvoiceList,
  ["invoice-list"],
  { revalidate: CACHE_SECONDS, tags: [INVOICE_CACHE_TAG] },
);

export const getInvoiceList = cache((): Promise<InvoiceListItem[]> =>
  getCachedInvoiceList(),
);

export const getInvoice = cache(async (id: string): Promise<Invoice | null> => {
  const invoiceId = normalizeNotionId(id);
  if (!invoiceId) return null;
  return getCachedInvoice(invoiceId);
});
