import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getAdminPassword } from "@/lib/env";

const SESSION_COOKIE = "admin_session";
// 세션 유지 기간: 7일
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// 관리자 비밀번호를 키로 서명 (비밀번호를 바꾸면 기존 세션은 모두 무효)
function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

// 입력한 비밀번호가 관리자 비밀번호와 일치하는지 확인 (타이밍 공격 방지)
export function verifyAdminPassword(input: string): boolean {
  const password = getAdminPassword();
  if (!password) return false;
  // 길이가 달라도 비교 시간이 같도록 해시끼리 비교
  return safeEqual(sign(input, "compare"), sign(password, "compare"));
}

export async function createAdminSession(): Promise<void> {
  const password = getAdminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD가 설정되지 않았습니다.");

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `admin.${expiresAt}`;
  const token = `${payload}.${sign(payload, password)}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// 유효한 관리자 세션인지 확인 (서명과 만료 시각 검증)
export async function isAdminAuthenticated(): Promise<boolean> {
  const password = getAdminPassword();
  if (!password) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  if (!safeEqual(signature, sign(payload, password))) return false;

  const expiresAt = Number(payload.split(".")[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
