"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface PdfDownloadButtonProps {
  invoiceId: string;
  invoiceNumber: string;
}

// 응답 헤더의 파일명을 우선 사용하고, 없으면 견적서 번호로 생성
function getFileName(response: Response, invoiceNumber: string): string {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename\*=UTF-8''([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return `invoice-${invoiceNumber || "download"}.pdf`;
}

export function PdfDownloadButton({
  invoiceId,
  invoiceNumber,
}: PdfDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/generate-pdf?id=${encodeURIComponent(invoiceId)}`,
      );
      if (response.status === 429) {
        throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
      }
      if (!response.ok) {
        throw new Error("PDF를 생성하지 못했습니다. 다시 시도해 주세요.");
      }

      // Blob을 임시 링크로 내려받기
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName(response, invoiceNumber);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button
        size="lg"
        onClick={handleDownload}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Download />}
        {isLoading ? "PDF 생성 중..." : "PDF 다운로드"}
      </Button>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
