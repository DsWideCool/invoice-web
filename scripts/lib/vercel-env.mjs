// Vercel CLI로 환경 변수를 등록·갱신하는 공용 함수
// 값은 명령줄 인자가 아니라 표준 입력으로 넘겨 셸 기록·프로세스 목록에 남지 않게 한다.
import { spawn } from "node:child_process";

export const DEFAULT_TARGETS = ["production", "preview"];

const NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

// 셸에 넘겨도 안전한 인자만 허용 (변수 이름·환경 이름·고정 옵션)
const SAFE_ARG_PATTERN = /^[A-Za-z0-9_-]+$/;

// vercel 명령 실행 (Windows의 vercel.cmd 실행을 위해 셸 사용)
// 값은 인자가 아니라 표준 입력으로만 전달하고, 인자는 안전한 문자만 허용
function runVercel(args, input) {
  if (!args.every((arg) => SAFE_ARG_PATTERN.test(arg))) {
    throw new Error(`허용되지 않은 인자: ${args.join(" ")}`);
  }
  return new Promise((resolve) => {
    const child = spawn(["vercel", ...args].join(" "), {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", (error) => resolve({ code: 1, output: error.message }));
    child.on("close", (code) => resolve({ code: code ?? 1, output }));
    if (input !== undefined) child.stdin.write(input);
    child.stdin.end();
  });
}

// CLI 설치·로그인·프로젝트 연결 확인
export async function assertVercelReady() {
  const who = await runVercel(["whoami"]);
  if (who.code !== 0) {
    throw new Error(
      "Vercel CLI를 쓸 수 없습니다. `npm i -g vercel` 설치 후 `vercel login`을 실행해 주세요.",
    );
  }
  const list = await runVercel(["env", "ls"]);
  if (list.code !== 0) {
    throw new Error(
      "이 폴더가 Vercel 프로젝트에 연결되어 있지 않습니다. `vercel link`를 실행해 주세요.",
    );
  }
}

// 환경 변수 하나를 지정한 환경들에 등록 (이미 있으면 --force로 덮어씀)
// NEXT_PUBLIC_ 변수(브라우저 공개 값)와 development 환경은 Sensitive로 저장할 수 없어 일반 값으로 등록
export async function setVercelEnv(name, value, targets = DEFAULT_TARGETS) {
  if (!NAME_PATTERN.test(name)) throw new Error(`잘못된 변수 이름: ${name}`);

  for (const target of targets) {
    const sensitive =
      !name.startsWith("NEXT_PUBLIC_") && target !== "development";
    const result = await runVercel(
      [
        "env",
        "add",
        name,
        "--environment",
        target,
        sensitive ? "--sensitive" : "--no-sensitive",
        "--force",
        "--yes",
      ],
      value,
    );
    if (result.code !== 0) {
      throw new Error(
        `${name} (${target}) 등록 실패:\n${result.output.trim()}`,
      );
    }
  }
}

// 환경 변수 삭제 (테스트 정리용)
export async function removeVercelEnv(name, targets = DEFAULT_TARGETS) {
  if (!NAME_PATTERN.test(name)) throw new Error(`잘못된 변수 이름: ${name}`);
  for (const target of targets) {
    const result = await runVercel([
      "env",
      "remove",
      name,
      "--environment",
      target,
      "--confirm-name",
      name,
    ]);
    if (result.code !== 0) {
      throw new Error(
        `${name} (${target}) 삭제 실패:\n${result.output.trim()}`,
      );
    }
  }
}

// 등록된 변수 이름 목록 (값은 가져오지 않음)
export async function listVercelEnvNames(target) {
  const result = await runVercel(["env", "ls", target]);
  if (result.code !== 0) throw new Error(result.output.trim());
  return result.output;
}

// "--targets production,preview" 형식 인자 해석
export function parseTargets(argv) {
  const index = argv.indexOf("--targets");
  if (index === -1) return DEFAULT_TARGETS;
  const targets = (argv[index + 1] ?? "").split(",").filter(Boolean);
  const allowed = new Set(["production", "preview", "development"]);
  if (targets.length === 0 || targets.some((t) => !allowed.has(t))) {
    throw new Error(
      "--targets는 production, preview, development 중에서 쉼표로 지정해 주세요.",
    );
  }
  return targets;
}
