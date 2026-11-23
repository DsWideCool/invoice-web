"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { getAppOrigin, getInvoiceUrl } from "@/lib/invoice-url";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  className?: string;
}

// 클라이언트에게 보낼 견적서 절대 URL을 복사하는 아이콘 버튼
export function CopyLinkButton({
  invoiceId,
  invoiceNumber,
  className,
}: CopyLinkButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  // 자동 복사가 모두 실패했을 때 직접 복사하도록 보여줄 URL
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const label = `${invoiceNumber || "견적서"} 링크 복사`;

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // 행 링크(상세 이동)로 이벤트가 전달되지 않도록 차단
    event.preventDefault();
    event.stopPropagation();

    const url = getInvoiceUrl(invoiceId, getAppOrigin());
    if (await copy(url)) {
      toast.success("견적서 링크를 복사했습니다", { description: url });
      return;
    }
    toast.error("링크를 자동으로 복사하지 못했습니다", {
      description: "표시된 링크를 직접 복사해 주세요.",
    });
    setManualUrl(url);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            aria-label={label}
            // 모바일 터치 영역 40px 이상 확보
            className={cn("size-10 sm:size-8", className)}
          >
            {copied ? (
              <Check className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Link2 />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "복사됨" : "링크 복사"}</TooltipContent>
      </Tooltip>

      <Dialog
        open={manualUrl !== null}
        onOpenChange={(open) => !open && setManualUrl(null)}
      >
        <DialogContent onClick={(event) => event.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>견적서 링크 직접 복사</DialogTitle>
            <DialogDescription>
              이 브라우저에서는 자동 복사를 사용할 수 없습니다. 아래 링크를
              선택한 뒤 Ctrl+C(⌘+C)로 복사해 주세요.
            </DialogDescription>
          </DialogHeader>
          <Input
            readOnly
            value={manualUrl ?? ""}
            aria-label={`${invoiceNumber || "견적서"} 링크`}
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            className="font-mono text-xs"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
