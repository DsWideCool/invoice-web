import { Wrench } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// 신고 DB가 설정되지 않았을 때 안내
export function ReportUnavailable({
  forAdmin = false,
}: {
  forAdmin?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <Wrench className="text-muted-foreground size-10" aria-hidden />
        <h2 className="text-lg font-semibold">신고 기능이 준비 중입니다</h2>
        <p className="text-muted-foreground text-sm">
          {forAdmin ? (
            <>
              <code className="bg-muted rounded px-1">
                npm run setup:report-db
              </code>
              로 Notion 신고 DB를 만들고{" "}
              <code className="bg-muted rounded px-1">
                NOTION_REPORT_DATABASE_ID
              </code>
              를 설정해 주세요.
            </>
          ) : (
            "잠시 후 다시 이용해 주세요."
          )}
        </p>
      </CardContent>
    </Card>
  );
}
