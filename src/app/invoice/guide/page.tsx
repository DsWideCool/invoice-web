import { Download, Link2, Mail, Printer } from "lucide-react";
import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "이용 안내",
};

const steps = [
  {
    icon: Mail,
    title: "링크 받기",
    description:
      "견적서 발행자에게 이메일이나 메신저로 견적서 링크를 받습니다.",
  },
  {
    icon: Link2,
    title: "견적서 확인",
    description:
      "링크를 열면 견적서 번호, 발행일, 유효기간, 항목별 금액과 총 금액을 확인할 수 있습니다.",
  },
  {
    icon: Download,
    title: "PDF 다운로드",
    description:
      "페이지 하단의 'PDF 다운로드' 버튼을 누르면 견적서가 PDF 파일로 저장됩니다.",
  },
  {
    icon: Printer,
    title: "보관 및 인쇄",
    description: "내려받은 PDF는 언제든 다시 열어보거나 인쇄할 수 있습니다.",
  },
] as const;

export default function GuidePage() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          견적서 이용 안내
        </h1>
        <p className="text-muted-foreground">
          별도 가입 없이 받은 링크만으로 견적서를 확인하고 PDF로 저장할 수
          있습니다.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card className="h-full">
              <CardHeader>
                <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                  <step.icon className="size-5" aria-hidden />
                </div>
                <CardTitle>
                  {index + 1}. {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>링크가 열리지 않나요?</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          링크 주소가 일부 잘렸거나 견적서가 삭제되었을 수 있습니다. 견적서를
          보내주신 분께 올바른 링크를 다시 요청해 주세요.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
