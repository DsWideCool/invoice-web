import { PublicHeader } from "@/components/layout/public-header";

// 클라이언트용 견적서 화면 공통 레이아웃: 상단 바(신고하기·내 신고 조회·테마 토글)
export default function InvoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicHeader />
      {children}
    </>
  );
}
