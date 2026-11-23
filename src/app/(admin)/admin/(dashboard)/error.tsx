"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// 목록 조회 실패(Notion 장애·키 오류·속도 제한 초과 등) 시 재시도 가능한 에러 화면
export default function AdminError({ error, reset }: AdminErrorProps) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // 서버 컴포넌트를 다시 요청한 뒤 에러 경계를 초기화
  const handleRetry = () => {
    startRetry(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <PageContainer className="min-h-[60dvh] max-w-5xl justify-center">
      <Card className="w-full max-w-md self-center">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <AlertTriangle className="text-destructive size-12" aria-hidden />
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">
              견적서 목록을 불러오지 못했습니다
            </h1>
            <p className="text-muted-foreground text-sm">
              Notion 연결에 일시적인 문제가 있거나 API 키·데이터베이스 설정이
              올바르지 않을 수 있습니다. 잠시 후 다시 시도해 주세요.
            </p>
            {error.digest && (
              <p className="text-muted-foreground font-mono text-xs">
                오류 코드: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={handleRetry} disabled={isRetrying}>
            <RotateCw className={isRetrying ? "animate-spin" : undefined} />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
