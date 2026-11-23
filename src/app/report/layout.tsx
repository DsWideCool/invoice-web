import type { Metadata } from "next";

import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: {
    default: "신고하기",
    template: "%s | 견적서 조회",
  },
};

// 신고 화면 공통 레이아웃: 견적서 화면과 같은 상단 바
export default function ReportLayout({
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
