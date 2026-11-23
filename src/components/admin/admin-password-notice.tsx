import { KeyRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/env";

// 관리자 비밀번호가 설정되지 않았을 때 안내
export function AdminPasswordNotice() {
  return (
    <Card className="w-full max-w-md self-center">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <KeyRound className="text-muted-foreground size-10" aria-hidden />
        <h1 className="text-lg font-semibold">관리자 비밀번호가 필요합니다</h1>
        <p className="text-muted-foreground text-sm">
          <code className="bg-muted rounded px-1">.env.local</code>에{" "}
          <code className="bg-muted rounded px-1">ADMIN_PASSWORD</code>를{" "}
          {MIN_ADMIN_PASSWORD_LENGTH}자 이상으로 설정한 뒤 서버를 다시 시작해
          주세요.
        </p>
      </CardContent>
    </Card>
  );
}
