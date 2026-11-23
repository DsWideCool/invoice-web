import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

// 신고 목록·상세 조회 중 스켈레톤
export default function AdminReportsLoading() {
  return (
    <PageContainer className="max-w-5xl" aria-busy="true">
      <span className="sr-only" role="status">
        신고를 불러오는 중입니다.
      </span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-7 w-16" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full sm:h-12" />
        ))}
      </div>
    </PageContainer>
  );
}
