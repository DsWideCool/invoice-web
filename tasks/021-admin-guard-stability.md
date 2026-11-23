# Task 021: 관리자 접근 보호 및 목록 조회 안정화

## 개요

미들웨어에서 `/admin` 경로를 보호하고 로그인 후 원래 경로로 복귀시킨다. Notion 429 응답에는 짧은 재시도를 둔다(F020).

## 관련 파일

- `src/lib/auth/constants.ts` - 쿠키 이름·경로 상수, `getSafeNextPath`, `isSessionTokenUnexpired`
- `src/middleware.ts` - `/admin` 가드와 `/api` 속도 제한 분기
- `src/lib/auth/session.ts` - 상수 모듈 사용
- `src/app/(admin)/admin/login/page.tsx`, `src/components/admin/login-form.tsx` - `next` 복귀
- `src/lib/services/invoice.service.ts` - `withRateLimitRetry`

## 수락 기준

- [x] 세션 쿠키가 없거나 만료되면 `/admin/login?next=<원래 경로>`로 리다이렉트된다
- [x] 로그인 성공 후 `next` 경로로 복귀하고, 외부 URL·프로토콜 상대 URL은 `/admin`으로 대체된다
- [x] `/admin` 경로에는 `/api` 속도 제한이 적용되지 않는다
- [x] Notion 429는 `Retry-After`(최대 5초) 기반으로 최대 2회 재시도하고, 그 외 오류는 에러 화면으로 전달된다

## 구현 단계

- [x] 1단계: 미들웨어·서버·클라이언트 공용 상수 모듈 분리
- [x] 2단계: 미들웨어 matcher에 `/admin`, `/admin/:path*` 추가 및 분기
- [x] 3단계: 로그인 페이지에서 `next` 검증 후 폼에 전달
- [x] 4단계: 목록 조회·페이지 조회에 429 재시도 적용

## 테스트 체크리스트

- [x] 쿠키 없이 `/admin` → `/admin/login?next=%2Fadmin`, 목록 데이터 미노출
- [x] 잘못된 비밀번호 → "비밀번호가 올바르지 않습니다."
- [x] `/admin?status=test` → 로그인 후 `/admin?status=test` 복귀
- [x] `/admin/login?next=https://example.com` → 로그인 후 `/admin`
- [x] `/admin` 응답에 `X-RateLimit-*` 헤더 없음
- [ ] 5회 실패 후 차단 메시지 — 기존 Task 013 기능, 이번에는 미실행(메모리 기반이라 차단되면 서버 재시작 필요)
- [ ] 429 재시도 — 실제 Notion 429 재현이 어려워 미실행

## 변경 사항 요약

- 미들웨어는 쿠키 존재·만료만 확인하고, HMAC 서명 검증은 기존대로 서버 컴포넌트의 `requireAdmin()`에서 수행
- 로그인 화면 자체를 `next`로 지정하면 무한 루프를 막기 위해 `/admin`으로 대체
