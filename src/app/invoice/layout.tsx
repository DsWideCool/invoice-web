import { ThemeToggle } from "@/components/theme-toggle";

// 클라이언트용 견적서 화면 공통 레이아웃: 우측 상단 테마 토글
export default function InvoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pt-3 sm:px-6 sm:pt-4 print:hidden">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
