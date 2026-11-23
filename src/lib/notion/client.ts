import "server-only";

import { Client } from "@notionhq/client";

import { getServerEnv } from "@/lib/env";

let notionClient: Client | null = null;

// Notion 클라이언트 싱글턴
export function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({
      auth: getServerEnv().NOTION_API_KEY,
      // SDK 기본값인 node-fetch v2는 사용 중단된 url.parse()를 호출하므로 Node 내장 fetch 사용
      // Notion 응답 캐시는 unstable_cache가 담당하므로 Next.js fetch 캐시는 끔
      fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
    });
  }
  return notionClient;
}
