# Task 016: 관리자 라우트 분리 및 레이아웃 골격 구축

## 개요

현재 `/` 페이지 하나에서 비밀번호 안내·로그인·목록을 분기하고 있다. 관리자 화면을 `/admin` 아래로 분리하고, 공통 관리자 헤더가 있는 레이아웃 골격을 만든다(F020). 클라이언트용 경로(`/invoice/[id]`, `/invoice/guide`, `/api/generate-pdf`)는 변경하지 않는다.

결정 사항 1: 목록을 `/admin`으로 옮기고 `/`는 `/admin`으로 리다이렉트한다.

## 관련 파일

- `src/app/page.tsx` - `/admin` 리다이렉트로 변경
- `src/app/(admin)/admin/layout.tsx` - 관리자 공통 레이아웃(비밀번호 미설정 안내)
- `src/app/(admin)/admin/login/page.tsx` - 로그인 화면(헤더 없음)
- `src/app/(admin)/admin/(dashboard)/layout.tsx` - 인증 확인 + 관리자 헤더
- `src/app/(admin)/admin/(dashboard)/page.tsx` - 견적서 목록
- `src/app/(admin)/admin/(dashboard)/loading.tsx`, `error.tsx` - 로딩·에러 골격
- `src/components/admin/admin-header.tsx` - 서비스명, 메뉴, 테마 토글 자리, 로그아웃
- `src/components/admin/admin-password-notice.tsx` - 기존 안내 카드 분리
- `src/components/admin/logout-button.tsx`, `list-actions.tsx` - 로그아웃을 헤더로 이동
- `src/lib/auth/session.ts` - `requireAdmin()` 추가
- `src/app/actions.ts` - 로그아웃 후 `/admin/login` 리다이렉트
- `src/app/invoice/[id]/page.tsx` - "목록으로" 링크를 `/admin`으로
- `src/app/not-found.tsx` - 클라이언트가 관리자 로그인으로 유도되지 않도록 "홈으로" 링크 제거

## 수락 기준

- [x] `/` 접속 시 `/admin`으로 이동한다
- [x] 미인증 상태로 `/admin` 접속 시 `/admin/login`으로 이동하고 목록 데이터가 노출되지 않는다
- [x] `/admin/login`은 헤더 없는 중앙 카드, 로그인 성공 시 `/admin`으로 이동한다
- [x] 인증 상태에서 `/admin/login` 접속 시 `/admin`으로 이동한다
- [x] `/admin`은 관리자 헤더(서비스명, 견적서 목록 메뉴, 로그아웃)와 목록을 표시한다
- [x] 로그아웃 시 `/admin/login`으로 이동한다
- [x] `ADMIN_PASSWORD` 미설정 시 `/admin`, `/admin/login` 모두 안내가 표시된다 (공통 레이아웃에서 처리 — 코드로 확인, 브라우저 미확인)
- [x] `/invoice/[id]`, `/invoice/guide`, `/api/generate-pdf`가 기존대로 동작한다
- [x] 404 페이지에 관리자 로그인으로 가는 링크가 없다

## 구현 단계

- [x] 1단계: 관리자 라우트 그룹과 레이아웃 생성
- [x] 2단계: 관리자 헤더·로그아웃 버튼 분리
- [x] 3단계: `/` 리다이렉트, 로그인/로그아웃 이동 경로 수정
- [x] 4단계: 상세 페이지·404 링크 정리
- [x] 5단계: `npm run check-all`, `npm run build` 통과 및 브라우저 확인

## 테스트 체크리스트

- [x] 쿠키 없이 `/admin` → `/admin/login`으로 리다이렉트
- [x] `/` → `/admin`(→ 미인증 시 `/admin/login`)
- [x] 로그인 성공 → `/admin` 목록 + 헤더 표시
- [x] 로그인 상태로 `/admin/login` → `/admin`
- [x] 목록 행 클릭 → `/invoice/<id>`, "목록으로" → `/admin`
- [x] 로그아웃 → `/admin/login`, 이후 `/admin` 재접근 시 로그인 화면
- [x] `/invoice/guide`, 존재하지 않는 경로(404) 정상 표시

## 변경 사항 요약

- 관리자 화면을 `src/app/(admin)/admin/` 아래로 분리: 공통 레이아웃(비밀번호 미설정 안내) → `login`(헤더 없음) / `(dashboard)`(인증 확인 + 관리자 헤더 + 목록·loading·error)
- `requireAdmin()`(`src/lib/auth/session.ts`)을 대시보드 레이아웃과 페이지 양쪽에서 호출해 미인증 시 `/admin/login`으로 리다이렉트
- `AdminHeader`(서비스명, "견적서 목록" 메뉴, 테마 토글 자리, 로그아웃) 추가, 로그아웃은 `ListActions`에서 헤더의 `LogoutButton`으로 이동하고 서버 액션에서 `/admin/login`으로 리다이렉트
- `/`는 `/admin`으로 리다이렉트, 로그인 성공 시 `/admin`으로 이동
- 상세 페이지 "목록으로" → `/admin`, 404 페이지의 "홈으로" 버튼 제거(이용 안내만 유지)
- 검증: `npm run check-all`의 typecheck·lint 통과(format 경고는 작업 외 파일 `.claude/agents/development-planner.md`), `npm run build` 성공, Playwright로 테스트 체크리스트 전 항목 확인, 비로그인 `/api/generate-pdf` 200 `application/pdf`
