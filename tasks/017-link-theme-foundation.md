# Task 017: 링크·테마 공통 유틸 및 프로바이더 골격 정의

## 개요

링크 복사(F021)와 다크모드(F022)가 공통으로 쓰는 유틸·환경 변수·프로바이더를 먼저 정의한다. 결정 사항 2(배포 도메인: `NEXT_PUBLIC_APP_URL` + `window.location.origin` 폴백)를 따른다.

## 관련 파일

- `src/lib/invoice-url.ts` - `getInvoicePath`, `getInvoiceUrl`, `getAppOrigin`
- `src/lib/public-env.ts` - 클라이언트 공개 환경 변수(`NEXT_PUBLIC_APP_URL`) Zod 검증
- `src/app/providers.tsx`, `src/app/layout.tsx` - 테마·툴팁·토스트 프로바이더 연결
- `src/components/ui/sonner.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `dialog.tsx` - shadcn/ui 추가
- `.env.example`, `.gitignore` - 환경 변수 예시 추가 및 커밋 허용

## 수락 기준

- [x] `getInvoicePath(id)`가 하이픈 없는 32자리 ID 경로를 반환한다
- [x] `NEXT_PUBLIC_APP_URL`은 선택값이며, http/https URL이 아니면 무시된다
- [x] 루트 레이아웃이 `Providers`로 감싸지고 기존 화면이 그대로 동작한다
- [x] `npm run typecheck` 통과

## 구현 단계

- [x] 1단계: `invoice-list.tsx`의 `getInvoiceHref`를 `src/lib/invoice-url.ts`로 이동
- [x] 2단계: `public-env.ts` 작성 (빌드 시 치환되도록 `process.env.NEXT_PUBLIC_APP_URL` 리터럴 참조)
- [x] 3단계: `next-themes` 설치, shadcn `sonner`·`tooltip`·`dialog` 추가 (`dropdown-menu`는 Task 019 토글 방식 변경으로 제거)
- [x] 4단계: `providers.tsx` 생성 및 루트 레이아웃 연결

## 변경 사항 요약

- 링크 유틸 3종과 공개 환경 변수 검증 모듈 추가, `.env.example`에 `NEXT_PUBLIC_APP_URL` 문서화
- `Providers`: `ThemeProvider`(class, system 기본) + `TooltipProvider` + `Toaster`(상단 중앙)
- shadcn 추가 시 기존 `button.tsx`는 덮어쓰지 않음
