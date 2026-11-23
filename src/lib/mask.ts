// 공개 목록용 이름 가리기: 첫 글자와 마지막 글자만 남김
// 예) 민준성 → 민*성, 남궁민수 → 남**수, 이준 → 이*, 김 → *
export function maskName(name: string): string {
  const chars = Array.from(name.trim());
  if (chars.length === 0) return "익명";
  if (chars.length === 1) return "*";
  if (chars.length === 2) return `${chars[0]}*`;
  return `${chars[0]}${"*".repeat(chars.length - 2)}${chars[chars.length - 1]}`;
}
