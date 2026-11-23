import "server-only";

import { Client } from "@notionhq/client";

import { getServerEnv } from "@/lib/env";

let notionClient: Client | null = null;

// Notion 클라이언트 싱글턴
export function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({ auth: getServerEnv().NOTION_API_KEY });
  }
  return notionClient;
}
