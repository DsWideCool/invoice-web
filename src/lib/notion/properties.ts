import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// Notion 페이지 속성 값을 안전하게 꺼내는 헬퍼 모음
type PageProperties = PageObjectResponse["properties"];
type PageProperty = PageProperties[string];

function getProperty(
  properties: PageProperties,
  name: string,
): PageProperty | undefined {
  return properties[name];
}

// title / rich_text 속성을 일반 문자열로 변환
export function getText(properties: PageProperties, name: string): string {
  const property = getProperty(properties, name);
  if (!property) return "";

  if (property.type === "title") {
    return property.title.map((t) => t.plain_text).join("");
  }
  if (property.type === "rich_text") {
    return property.rich_text.map((t) => t.plain_text).join("");
  }
  return "";
}

// number / formula(number) 속성을 숫자로 변환
export function getNumber(
  properties: PageProperties,
  name: string,
): number | null {
  const property = getProperty(properties, name);
  if (!property) return null;

  if (property.type === "number") {
    return property.number;
  }
  if (property.type === "formula" && property.formula.type === "number") {
    return property.formula.number;
  }
  return null;
}

// date 속성의 시작일을 반환
export function getDate(
  properties: PageProperties,
  name: string,
): string | null {
  const property = getProperty(properties, name);
  if (property?.type !== "date") return null;
  return property.date?.start ?? null;
}

// status / select 속성의 이름을 반환
export function getStatusName(
  properties: PageProperties,
  name: string,
): string | null {
  const property = getProperty(properties, name);
  if (!property) return null;

  if (property.type === "status") {
    return property.status?.name ?? null;
  }
  if (property.type === "select") {
    return property.select?.name ?? null;
  }
  return null;
}

// relation 속성의 연결된 페이지 ID 목록을 반환
export function getRelationIds(
  properties: PageProperties,
  name: string,
): string[] {
  const property = getProperty(properties, name);
  if (property?.type !== "relation") return [];
  return property.relation.map((r) => r.id);
}
