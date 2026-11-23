# Task 019: 다크모드 테마 시스템 및 토글 구현

## 개요

`next-themes`로 라이트/다크 테마를 지원하고(처음에는 OS 설정을 따름), 관리자 화면과 클라이언트 견적서 화면 모두에 토글을 둔다. 인쇄물과 PDF는 항상 라이트로 유지한다(F022).

## 관련 파일

- `src/app/layout.tsx` - `<html suppressHydrationWarning>`
- `src/app/globals.css` - 인쇄 제외 `dark` 변형, `color-scheme`, `@media print` 라이트 토큰
- `src/components/theme-toggle.tsx` - `ThemeToggle`(클릭 시 라이트 ↔ 다크 전환), `CornerThemeToggle`(헤더 없는 화면용)
- `src/app/invoice/layout.tsx` - 견적서 조회·이용 안내 우측 상단 토글
- `src/app/(admin)/admin/layout.tsx`, `login/page.tsx`, `src/app/not-found.tsx` - 우측 상단 토글
- `src/components/admin/admin-header.tsx` - 헤더 토글
- `src/components/invoice/pdf-download-button.tsx`, `src/app/invoice/[id]/page.tsx` - 인쇄 시 버튼 숨김

## 수락 기준

- [x] 라이트 ↔ 다크 전환 토글이 관리자 화면과 견적서 조회 페이지에 있다
- [x] 첫 방문 시 OS 설정을 따르고, 토글을 누르기 전까지 OS 변경이 즉시 반영된다
- [x] 선택한 테마가 새로고침 후에도 유지된다(localStorage `theme`)
- [x] 새로고침 시 깜빡임이 없고 hydration 경고가 없다
- [x] 관리자 목록·로그인·견적서 조회·이용 안내·404가 다크에서 읽을 수 있다
- [x] 다운로드 PDF는 테마와 무관하다
- [x] 인쇄(Ctrl+P) 결과는 다크 테마에서도 라이트다

## 구현 단계

- [x] 1단계: `ThemeProvider` 연결(Task 017), `suppressHydrationWarning`
- [x] 2단계: `ThemeToggle` 작성 — 아이콘은 `dark:` 클래스로 전환해 마운트 전 불일치 방지
- [x] 3단계: 관리자 헤더·견적서 화면·헤더 없는 화면에 토글 배치
- [x] 4단계: 인쇄 스타일 — `dark` 변형을 `@media not print`로 감싸고, 인쇄 시 `.dark` 토큰을 라이트 값으로 덮어씀
- [x] 5단계: 다크 대비 점검

## 테스트 체크리스트

- [x] colorScheme dark 첫 방문 → `<html class="dark">`
- [x] 다크 상태에서 토글 클릭 → `light`, 다시 클릭 → `dark`, 한 번 더 → `light` → 새로고침 후 `light` 유지
- [x] 토글 미사용 상태에서 OS light ↔ dark 전환 즉시 반영, 토글 클릭마다 dark ↔ light 전환
- [x] 다크 새로고침 직후(commit 시점) 이미 `dark`, 프로덕션 빌드 콘솔 경고 없음
- [x] 주요 화면 다크 스크린샷 확인, 404 토글 1개
- [x] PDF API 200 `application/pdf`
- [x] print 매체: body·카드 흰색, 배지 라이트 색상, 버튼 숨김

## 변경 사항 요약

- 다크 점검 결과 `body`의 `bg-muted/40`, 상태 배지(이미 `dark:` 색상 보유)는 토큰 기반이라 수정 불필요
- `dark:` 변형을 인쇄에서 제외해 shadcn 컴포넌트·상태 배지까지 인쇄 시 자동으로 라이트가 됨
- 클라이언트 견적서 화면은 상단 토글 바 때문에 `PageContainer` 상단 여백을 줄임
- PDF 파일 내용(흰 배경)은 열어서 보지 않았고, 서버 생성 구조상 테마 영향이 없음을 응답으로만 확인
- 사용자 요청으로 토글을 라이트/다크/시스템 드롭다운에서 "클릭 시 라이트 ↔ 다크 전환" 버튼으로 변경하고 `dropdown-menu` 컴포넌트 제거. 처음 방문 시에는 OS 설정을 따르며, 한 번 누르면 선택한 테마가 저장되어 이후에는 OS 설정을 따르지 않음
