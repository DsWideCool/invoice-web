"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface InvoiceErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Notion API 장애 등 예기치 못한 오류 시 표시
export default function InvoiceError({ error, reset }: InvoiceErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="min-h-dvh justify-center">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <AlertTriangle className="text-destructive size-12" aria-hidden />
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">
              견적서를 불러오지 못했습니다
            </h1>
            <p className="text-muted-foreground text-sm">
              일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.
            </p>
          </div>
          <Button onClick={reset}>다시 시도</Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
