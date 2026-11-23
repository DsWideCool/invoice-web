"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/login";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    const result = await loginAction(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    // 세션 쿠키가 설정되었으므로 서버 컴포넌트를 다시 렌더링
    router.refresh();
  };

  const errorMessage = errors.password?.message ?? serverError;

  return (
    <Card className="w-full max-w-sm self-center">
      <CardHeader>
        <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
          <Lock className="size-5" aria-hidden />
        </div>
        <CardTitle>관리자 로그인</CardTitle>
        <CardDescription>
          견적서 목록은 관리자만 볼 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? "password-error" : undefined}
              {...register("password")}
            />
            {errorMessage && (
              <p
                id="password-error"
                role="alert"
                className="text-destructive text-sm"
              >
                {errorMessage}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            로그인
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
