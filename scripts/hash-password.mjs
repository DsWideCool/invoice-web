// 관리자 비밀번호 해시(ADMIN_PASSWORD_HASH)와 세션 서명 키(SESSION_SECRET) 생성 스크립트
// 사용법: npm run hash-password
// 비밀번호는 화면에 표시되지 않으며, 출력된 두 값을 Vercel 환경 변수(Sensitive)에 등록한다.
// 해시 형식은 src/lib/auth/password-hash.ts와 같아야 한다.
import { randomBytes, scryptSync } from "node:crypto";
import { stdin, stdout } from "node:process";

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

console.log("\n아래 두 값을 Vercel 환경 변수(Sensitive)에 등록하세요.\n");
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password.trim())}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
