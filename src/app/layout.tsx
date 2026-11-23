import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";

import { Providers } from "./providers";

import "./globals.css";

// 한글 본문 폰트 (globals.css의 --font-sans로 연결)
const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "견적서 조회",
    template: "%s | 견적서 조회",
  },
  description: "노션 기반 견적서 조회 및 PDF 다운로드 서비스",
  // 견적서는 비공개 링크로만 공유되므로 검색엔진 노출 차단
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes가 hydration 전에 html의 class를 바꾸므로 해당 경고만 억제
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKr.variable} ${geistMono.variable} bg-muted/40 min-h-dvh antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
