// Notion 신고 DB 생성 스크립트
// 사용법: npm run setup:report-db -- <Notion 페이지 URL 또는 ID>
// 전제: 해당 페이지가 Notion 연동(Integration)에 공유되어 있어야 함 (페이지 ⋯ → 연결 → 연동 추가)
// 속성 이름은 src/lib/services/report.service.ts의 REPORT_PROPS와 일치해야 함
import { Client } from "@notionhq/client";

const input = process.argv[2];
const apiKey = process.env.NOTION_API_KEY;

if (!apiKey) {
  console.error("NOTION_API_KEY가 없습니다. .env.local을 확인해 주세요.");
  process.exit(1);
}

// URL 끝의 32자리 16진수(하이픈 포함 가능)에서 페이지 ID 추출
const match = input?.replace(/-/g, "").match(/([0-9a-f]{32})(?:\?|$)/i);
if (!match) {
  console.error(
    "사용법: npm run setup:report-db -- <Notion 페이지 URL 또는 ID>",
  );
  process.exit(1);
}

const notion = new Client({ auth: apiKey, fetch });

try {
  const database = await notion.databases.create({
    parent: { type: "page_id", page_id: match[1] },
    title: [{ type: "text", text: { content: "Reports" } }],
    is_inline: true,
    properties: {
      제목: { title: {} },
      "신고 번호": { rich_text: {} },
      작성자: { rich_text: {} },
      내용: { rich_text: {} },
      상태: {
        select: {
          options: [
            { name: "작성", color: "yellow" },
            { name: "접수", color: "blue" },
            { name: "처리완료", color: "green" },
          ],
        },
      },
      답변: { rich_text: {} },
      답변일: { date: {} },
      "조회 비밀번호 해시": { rich_text: {} },
      작성일: { created_time: {} },
    },
  });

  console.log("신고 DB를 만들었습니다.");
  console.log("아래 값을 .env.local과 Vercel 환경 변수에 추가하세요.\n");
  console.log(`NOTION_REPORT_DATABASE_ID=${database.id.replace(/-/g, "")}`);
} catch (error) {
  console.error(
    "신고 DB를 만들지 못했습니다:",
    error.code ?? "",
    error.message,
  );
  if (error.code === "object_not_found") {
    console.error("페이지가 Notion 연동에 공유되어 있는지 확인해 주세요.");
  }
  process.exit(1);
}
