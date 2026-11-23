// 배포용 환경 변수 파일(.env.vercel)을 Vercel에 한 번에 등록·갱신
// 사용법: npm run env:push [-- --file .env.vercel] [-- --targets production,preview]
// 값은 화면에 출력하지 않으며, 등록 후에는 재배포해야 반영된다.
import { existsSync, readFileSync } from "node:fs";

import {
  assertVercelReady,
  parseTargets,
  setVercelEnv,
} from "./lib/vercel-env.mjs";

// Vercel이 자동으로 넣거나 로컬 전용인 변수는 올리지 않음
const SKIP_KEYS = new Set(["NODE_ENV", "VERCEL_OIDC_TOKEN"]);

// KEY=VALUE 줄 해석 (주석·빈 줄·빈 값 제외, 양쪽 따옴표 제거)
function parseEnvFile(content) {
  const entries = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/,
    );
    if (!match) continue;
    let value = match[2].trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (value) entries.push([match[1], value]);
  }
  return entries;
}

const argv = process.argv.slice(2);
const fileIndex = argv.indexOf("--file");
const file = fileIndex === -1 ? ".env.vercel" : argv[fileIndex + 1];

try {
  const targets = parseTargets(argv);
  if (!file || !existsSync(file)) {
    throw new Error(
      `${file ?? "(파일 없음)"} 파일이 없습니다. .env.example을 참고해 배포용 값을 채운 .env.vercel을 만들어 주세요.`,
    );
  }

  const entries = parseEnvFile(readFileSync(file, "utf8")).filter(
    ([key]) => !SKIP_KEYS.has(key) && !key.startsWith("VERCEL_"),
  );
  if (entries.length === 0) throw new Error(`${file}에 등록할 값이 없습니다.`);

  await assertVercelReady();
  console.log(`${file} → Vercel (${targets.join(", ")})`);
  for (const [key, value] of entries) {
    await setVercelEnv(key, value, targets);
    console.log(`  ✓ ${key}`);
  }
  console.log(
    "\n등록을 마쳤습니다. 새 값은 다음 배포부터 적용됩니다 (git push 또는 Vercel에서 최신 배포 Redeploy).",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
