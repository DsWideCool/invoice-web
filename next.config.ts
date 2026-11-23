import type { NextConfig } from "next";

// 모든 응답에 적용할 보안 헤더
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // react-pdf는 번들링하지 않고 Node.js 모듈로 불러옴
  serverExternalPackages: ["@react-pdf/renderer"],
  // 서버리스 배포 시 PDF 폰트 파일을 함수에 포함
  outputFileTracingIncludes: {
    "/api/generate-pdf": ["./public/fonts/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
