import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 5;

// 견적서 목록 조회 중 스켈레톤: 모바일은 카드형, 640px 이상은 테이블형
export default function AdminInvoiceListLoading() {
  return (
    <PageContainer className="max-w-5xl" aria-busy="true">
      <span className="sr-only" role="status">
        견적서 목록을 불러오는 중입니다.
      </span>

      {/* 제목 + 새로고침 버튼 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* 검색 + 상태 필터 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-8 w-full sm:w-72" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-12" />
          ))}
        </div>
      </div>
      <Skeleton className="h-4 w-14" />

      {/* 모바일: 카드형 */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <li
            key={i}
            className="bg-card flex flex-col gap-2 rounded-lg border p-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-28" />
          </li>
        ))}
      </ul>

      {/* 태블릿 이상: 테이블형 */}
      <div className="bg-card hidden rounded-lg border sm:block">
        <div className="flex gap-4 border-b px-4 py-3">
          {["w-24", "w-20", "w-16", "w-10", "ml-auto w-16"].map((width, i) => (
            <Skeleton key={i} className={`h-4 ${width}`} />
          ))}
        </div>
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="ml-auto h-4 w-24" />
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
