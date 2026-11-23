import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

// 라벨 + 입력 + 설명/에러 메시지 묶음 (입력 요소에는 id·aria-describedby를 직접 지정)
export function FormField({
  id,
  label,
  error,
  description,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        description && (
          <p id={`${id}-description`} className="text-muted-foreground text-xs">
            {description}
          </p>
        )
      )}
    </div>
  );
}

// 입력 요소에 연결할 aria 속성
export function getFieldAria(id: string, error?: string) {
  return {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : `${id}-description`,
  };
}
