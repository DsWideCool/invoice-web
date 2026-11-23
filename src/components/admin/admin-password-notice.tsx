import { KeyRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  MIN_ADMIN_PASSWORD_LENGTH,
  MIN_SESSION_SECRET_LENGTH,
} from "@/lib/env";

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-muted rounded px-1">{children}</code>;
}

// 관리자 비밀번호가 설정되지 않았을 때 안내
export function AdminPasswordNotice() {
  return (
    <Card className="w-full max-w-md self-center">
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <KeyRound className="text-muted-foreground size-10" aria-hidden />
        <h1 className="text-lg font-semibold">관리자 비밀번호가 필요합니다</h1>
        <div className="text-muted-foreground flex flex-col gap-3 text-left text-sm">
          <p>
            <strong className="text-foreground">배포 환경</strong>:{" "}
            <Code>npm run hash-password</Code>로 만든{" "}
            <Code>ADMIN_PASSWORD_HASH</Code>와 <Code>SESSION_SECRET</Code>(
            {MIN_SESSION_SECRET_LENGTH}자 이상)을 환경 변수에 설정한 뒤 다시
            배포해 주세요.
          </p>
          <p>
            <strong className="text-foreground">로컬 개발</strong>:{" "}
            <Code>.env.local</Code>에 <Code>ADMIN_PASSWORD</Code>를{" "}
            {MIN_ADMIN_PASSWORD_LENGTH}자 이상으로 설정해도 됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
