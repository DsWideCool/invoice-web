import { cn } from "@/lib/utils";

// 모든 페이지 공통 여백/최대 너비
export function PageContainer({
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12",
        className,
      )}
      {...props}
    />
  );
}
