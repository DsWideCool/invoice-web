import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_LOGIN_PATH,
  isSessionTokenUnexpired,
  SESSION_COOKIE,
} from "@/lib/auth/constants";
import { verifyPasswordHash } from "@/lib/auth/password-hash";
import { getAdminAuthConfig } from "@/lib/env";

// 세션 유지 기간: 7일
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

// 관리자 로그인 기능 사용 가능 여부 (비밀번호·해시 설정 확인)
export function isAdminLoginConfigured(): boolean {
  return getAdminAuthConfig() !== null;
}

// 입력한 비밀번호가 관리자 비밀번호와 일치하는지 확인 (타이밍 공격 방지)
export function verifyAdminPassword(input: string): boolean {
  const config = getAdminAuthConfig();
  if (!config) return false;

  const { credential } = config;
  if (credential.type === "hash") {
    return verifyPasswordHash(input, credential.hash);
  }
  // 길이가 달라도 비교 시간이 같도록 HMAC 값끼리 비교
  return safeEqual(
    sign(input, "compare"),
    sign(credential.password, "compare"),
  );
}

export async function createAdminSession(): Promise<void> {
  const config = getAdminAuthConfig();
  if (!config) throw new Error("관리자 비밀번호가 설정되지 않았습니다.");

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `admin.${expiresAt}`;
  const token = `${payload}.${sign(payload, config.signingKey)}`;

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
  const config = getAdminAuthConfig();
  if (!config) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);

  if (!safeEqual(signature, sign(payload, config.signingKey))) return false;

  return isSessionTokenUnexpired(payload);
}

// 관리자 전용 화면에서 호출: 미인증이면 로그인 화면으로 이동
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) redirect(ADMIN_LOGIN_PATH);
}
