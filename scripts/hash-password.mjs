// 관리자 비밀번호 해시(ADMIN_PASSWORD_HASH)와 세션 서명 키(SESSION_SECRET) 생성 스크립트
// 사용법:
//   npm run hash-password                  → 두 값을 화면에 출력 (직접 Vercel에 등록)
//   npm run hash-password -- --push        → 화면에 출력하지 않고 Vercel(production·preview)에 바로 등록
//   npm run hash-password -- --push --targets production
// 비밀번호는 입력할 때 화면에 표시되지 않는다.
// 해시 형식은 src/lib/auth/password-hash.ts와 같아야 한다.
import { randomBytes, scryptSync } from "node:crypto";
import { argv, stdin, stdout } from "node:process";

import {
  assertVercelReady,
  parseTargets,
  setVercelEnv,
} from "./lib/vercel-env.mjs";

const MIN_LENGTH = 8;
const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 32;

// 입력 내용을 화면에 표시하지 않고 한 줄을 읽음 (TTY가 아니면 표준 입력에서 읽음)
function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    stdout.write(prompt);
    if (!stdin.isTTY) {
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (chunk) => (data += chunk));
      stdin.on("end", () => resolve(data.split(/\r?\n/)[0] ?? ""));
      stdin.on("error", reject);
      return;
    }

    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };
    stdin.on("data", onData);
  });
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join(":");
}

const shouldPush = argv.includes("--push");
const targets = shouldPush ? parseTargets(argv) : [];

// 비밀번호를 입력받기 전에 Vercel 연결부터 확인 (실패 시 바로 종료)
if (shouldPush) {
  try {
    await assertVercelReady();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const password = await readHidden("관리자 비밀번호: ");
if (password.trim().length < MIN_LENGTH) {
  console.error(`비밀번호는 ${MIN_LENGTH}자 이상이어야 합니다.`);
  process.exit(1);
}
if (stdin.isTTY) {
  const confirm = await readHidden("비밀번호 확인: ");
  if (confirm !== password) {
    console.error("두 비밀번호가 일치하지 않습니다.");
    process.exit(1);
  }
}

const values = {
  ADMIN_PASSWORD_HASH: hashPassword(password.trim()),
  SESSION_SECRET: randomBytes(32).toString("base64url"),
};

if (shouldPush) {
  try {
    console.log(
      `\nVercel (${targets.join(", ")})에 등록합니다. 값은 화면에 표시하지 않습니다.`,
    );
    for (const [key, value] of Object.entries(values)) {
      await setVercelEnv(key, value, targets);
      console.log(`  ✓ ${key}`);
    }
    console.log(
      "\n등록을 마쳤습니다. 다음 배포부터 새 비밀번호가 적용되고 기존 로그인은 모두 끊깁니다.",
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
} else {
  console.log("\n아래 두 값을 Vercel 환경 변수(Sensitive)에 등록하세요.\n");
  for (const [key, value] of Object.entries(values)) {
    console.log(`${key}=${value}`);
  }
}
