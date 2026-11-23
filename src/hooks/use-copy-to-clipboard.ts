"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 복사 성공 표시를 유지하는 시간
const COPIED_RESET_MS = 2000;

// 1순위: Clipboard API (HTTPS·localhost에서만 사용 가능, 권한 거부 시 실패)
async function writeWithClipboardApi(text: string): Promise<boolean> {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// 2순위: 숨긴 textarea를 선택해 execCommand("copy") (HTTP·구형 브라우저 대비)
function writeWithExecCommand(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

// 클립보드 복사 훅: 성공 여부를 반환하고, 성공 시 2초간 copied 상태 유지
// 두 방식 모두 실패하면 false를 반환하므로 호출 측에서 수동 복사 UI를 띄운다
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    const success =
      (await writeWithClipboardApi(text)) || writeWithExecCommand(text);

    if (success) {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    }
    return success;
  }, []);

  return { copied, copy };
}
