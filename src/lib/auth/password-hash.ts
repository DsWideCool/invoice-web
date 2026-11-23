import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// 해시 형식: scrypt:<N>:<r>:<p>:<salt(base64url)>:<hash(base64url)>
// .env 파일의 변수 확장($)과 충돌하지 않도록 구분자로 ':'를 사용
// scripts/hash-password.mjs와 형식이 같아야 함
const PREFIX = "scrypt";
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const DEFAULT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

interface ParsedHash {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
}

function parseHash(value: string): ParsedHash | null {
  const parts = value.trim().split(":");
  if (parts.length !== 6 || parts[0] !== PREFIX) return null;

  const [N, r, p] = parts.slice(1, 4).map(Number);
  const salt = Buffer.from(parts[4], "base64url");
  const hash = Buffer.from(parts[5], "base64url");
  const isValidNumber = (n: number) => Number.isInteger(n) && n > 0;

  if (![N, r, p].every(isValidNumber) || salt.length === 0) return null;
  if (hash.length !== KEY_LENGTH) return null;
  return { N, r, p, salt, hash };
}

// 저장된 값이 올바른 형식의 해시인지 확인
export function isPasswordHash(value: string): boolean {
  return parseHash(value) !== null;
}

// 비밀번호를 scrypt로 해시 (salt 포함 문자열 반환)
export function hashPassword(password: string): string {
  const { N, r, p } = DEFAULT_PARAMS;
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(password, salt, KEY_LENGTH, { N, r, p });
  return [
    PREFIX,
    N,
    r,
    p,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join(":");
}

// 입력한 비밀번호가 해시와 일치하는지 확인 (타이밍 공격 방지)
export function verifyPasswordHash(password: string, stored: string): boolean {
  const parsed = parseHash(stored);
  if (!parsed) return false;

  try {
    const { N, r, p, salt, hash } = parsed;
    const candidate = scryptSync(password, salt, KEY_LENGTH, { N, r, p });
    return timingSafeEqual(candidate, hash);
  } catch {
    return false;
  }
}
