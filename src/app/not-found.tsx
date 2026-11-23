import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// 존재하지 않는 견적서/페이지 접근 시 표시
export default function NotFound() {
  return (
    <PageContainer className="min-h-dvh justify-center">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <FileQuestion className="text-muted-foreground size-12" aria-hidden />
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm font-medium">404</p>
            <h1 className="text-xl font-semibold sm:text-2xl">
              견적서를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground text-sm">
              링크가 잘못되었거나 더 이상 유효하지 않은 견적서입니다.
              <br className="hidden sm:inline" />
              견적서를 보내주신 분께 올바른 링크를 다시 요청해 주세요.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/invoice/guide">이용 안내 보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
