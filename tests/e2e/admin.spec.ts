/**
 * 관리자 고도화 기능 E2E 테스트 시나리오 (Playwright MCP)
 *
 * 대상 요구사항: F020(관리자 레이아웃·목록), F021(링크 복사), F022(다크모드)
 * 이 파일은 Playwright MCP 도구(browser_run_code_unsafe 등)로 실행하는 시나리오 문서입니다.
 *
 * 테스트 전제 조건:
 * - `npm run dev` 실행 (예: http://localhost:3000)
 * - .env.local에 NOTION_API_KEY, NOTION_DATABASE_ID, ADMIN_PASSWORD(8자 이상) 설정
 * - Notion 견적서 DB에 견적서 1건 이상 존재
 * - 로그인 실패 제한(IP당 10분 5회)은 메모리 기반이므로, 차단 시나리오 후에는 서버를 재시작
 */

/**
 * 시나리오 F020-1: 관리자 접근 보호
 *
 * 1. 쿠키 없이 /admin 이동 → /admin/login?next=%2Fadmin 으로 리다이렉트
 * 2. 로그인 화면에 table·견적서 데이터(클라이언트명·금액)가 없음
 * 3. / 이동 → /admin → /admin/login 순으로 리다이렉트
 * 4. curl -I /admin 응답에 X-RateLimit-* 헤더가 없음 (/api 속도 제한과 분리)
 *
 * 검증 기준:
 * - ✅ 미인증 사용자는 목록 데이터를 볼 수 없음
 */

/**
 * 시나리오 F020-2: 로그인·복귀·로그아웃
 *
 * 1. 잘못된 비밀번호 입력 → #password-error에 "비밀번호가 올바르지 않습니다."
 * 2. (선택) 5회 연속 실패 → "로그인 시도가 너무 많습니다. N분 후 다시 시도해 주세요."
 * 3. /admin?status=test 접근 → /admin/login?next=%2Fadmin%3Fstatus%3Dtest → 로그인 후 /admin?status=test 복귀
 * 4. /admin/login?next=https://example.com 로그인 → /admin으로 이동(외부 이동 없음)
 * 5. 로그인 상태로 /admin/login 접근 → /admin
 * 6. 헤더의 "로그아웃" → /admin/login, 이후 /admin 재접근 시 로그인 화면
 *
 * 검증 기준:
 * - ✅ next 파라미터로 복귀, 오픈 리다이렉트 차단
 */

/**
 * 시나리오 F020-3: 레이아웃·반응형·로딩·에러
 *
 * 1. 1280px: 헤더(서비스명 "견적서 관리", "견적서 목록" 메뉴, 테마 토글, "로그아웃" 텍스트 버튼) + 테이블
 * 2. 375px: 헤더는 서비스명 + 아이콘 버튼만, 목록은 카드형
 * 3. 두 폭 모두 document.documentElement.scrollWidth <= innerWidth (가로 스크롤 없음)
 * 4. 테이블 행 클릭 → /admin/invoices/<32자리 ID>(관리자용 상세: 목록으로·링크 복사·클라이언트 화면), "목록으로" → /admin
 * 5. 에러: NOTION_API_KEY를 잘못된 값으로 서버 실행 → 로그인 후 "견적서 목록을 불러오지 못했습니다" + "다시 시도" 버튼
 *    (예: `NOTION_API_KEY=invalid npx next start -p 3457`, 캐시를 피하려면 .next 삭제 후 빌드)
 * 6. 빈 목록: Notion DB가 비어 있으면 "Notion에 등록된 견적서가 없습니다." 표시
 */

/**
 * 시나리오 F021: 견적서 링크 복사
 *
 * 1. context.grantPermissions(["clipboard-read", "clipboard-write"])
 * 2. 테이블 첫 행의 복사 버튼(aria-label "<견적서 번호> 링크 복사") 클릭
 *    → "견적서 링크를 복사했습니다" 토스트, URL은 /admin 그대로
 * 3. navigator.clipboard.readText() 값이 `<NEXT_PUBLIC_APP_URL 또는 origin>/invoice/<32자리 ID>` 형식
 * 4. 새 컨텍스트(비로그인)에서 복사한 URL 이동 → 견적서 표시, "목록으로" 링크 없음
 * 5. 375px 카드의 복사 버튼: 크기 40×40 이상, 클릭해도 상세로 이동하지 않음
 * 6. 버튼에 focus 후 Enter → 두 번째 견적서 링크가 복사됨
 * 7. navigator.clipboard.writeText를 reject로 교체 → execCommand 폴백으로 복사 성공 토스트
 * 8. writeText reject + document.execCommand = () => false
 *    → "링크를 자동으로 복사하지 못했습니다" 토스트 + "견적서 링크 직접 복사" 다이얼로그,
 *      읽기 전용 입력에 URL이 전체 선택된 상태
 */

/**
 * 시나리오 F022: 다크모드
 *
 * 1. colorScheme: "dark" 새 컨텍스트로 첫 방문 → <html class="dark">
 * 2. 테마 토글(aria-label "라이트/다크 모드 전환") 클릭 → light, 다시 클릭 → dark, 한 번 더 클릭 → light → 새로고침 후 class "light", localStorage.theme === "light"
 * 3. 토글을 누르지 않은 새 컨텍스트에서 emulateMedia colorScheme light ↔ dark → class 즉시 변경
 * 4. 다크 상태에서 waitUntil "commit" 직후 html class가 이미 "dark" (FOUC 없음), 콘솔에 hydration 경고 없음
 * 5. 관리자 목록(375·1280)·로그인·견적서 조회·이용 안내·404를 다크로 스크린샷 확인, 404의 토글은 1개
 * 6. /api/generate-pdf?id=<ID> → 200, Content-Type application/pdf (PDF는 서버 생성이라 테마 무관)
 * 7. emulateMedia media "print" → body 배경 흰색, 카드 흰색, 상태 배지 라이트 색상,
 *    PDF 다운로드·상단 바(신고하기·테마 토글) 숨김 (배지 transition 때문에 0.5초 대기 후 측정)
 */

export {};
