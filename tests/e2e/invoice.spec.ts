/**
 * 견적서 E2E 테스트 시나리오 (Playwright MCP)
 *
 * 이 파일은 Playwright MCP 도구를 사용하여 실행되는 테스트 시나리오입니다.
 * Claude Code의 Playwright MCP 도구를 통해 실제 브라우저에서 테스트를 수행합니다.
 *
 * 테스트 전제 조건:
 * - 개발 서버가 http://localhost:3000 또는 http://localhost:3001에서 실행 중이어야 함
 * - .env.local에 유효한 NOTION_API_KEY와 NOTION_DATABASE_ID 설정 필요
 * - 테스트용 견적서 페이지 ID 준비 필요 (실제 Notion 페이지 ID, 하이픈 없는 32자리)
 * - 견적서 조회 페이지는 로그인 없이 접근 가능하며, 관리자로 로그인한 브라우저에서도 관리자 화면 링크(목록으로 등)를 표시하지 않음
 */

/**
 * 테스트 시나리오 1: 정상적인 견적서 조회
 *
 * 목표: 유효한 견적서 ID로 페이지에 접근하여 모든 섹션이 올바르게 렌더링되는지 확인
 *
 * 실행 순서:
 * 1. Playwright MCP browser_navigate 도구 사용
 *    - URL: http://localhost:3000/invoice/[valid-notion-page-id]
 *    - [valid-notion-page-id]를 실제 Notion 페이지 ID로 교체
 *
 * 2. browser_snapshot 도구로 페이지 스냅샷 확인
 *    - 페이지가 정상적으로 로드되었는지 확인
 *
 * 3. 견적서 섹션 존재 확인 (browser_snapshot 결과에서 확인):
 *    - 페이지 타이틀: "견적서 <견적서 번호> | 견적서 조회"
 *    - 견적서 헤더 카드: "견적서" 라벨, 견적서 번호, 상태 배지(대기/승인/거절)
 *    - 클라이언트·발행일·유효기간 3열 정보
 *    - "견적 항목" 카드: 항목명, 수량, 단가, 금액 컬럼
 *    - 테이블에 최소 1개 이상의 항목 행
 *    - 금액 요약: "항목 합계", "총 금액"
 *    - 우측 상단 테마 토글(aria-label "라이트/다크 모드 전환", 클릭 시 라이트 ↔ 다크)
 *    - PDF 다운로드 버튼
 *    - 로그인 여부와 무관하게 "목록으로" 등 /admin 링크가 없어야 함 (상단 바의 신고하기·내 신고 조회는 ?from=<현재 경로> 포함)
 *
 * 4. 시각적 확인:
 *    - 스켈레톤 UI가 먼저 보이고 실제 콘텐츠로 전환되는지 확인 (캐시 미적중 시)
 *    - 모든 텍스트가 한글 폰트로 렌더링되는지 확인
 *
 * 검증 기준:
 * - ✅ 페이지가 에러 없이 로드됨
 * - ✅ 모든 섹션이 렌더링됨
 * - ✅ 데이터가 Notion에서 올바르게 가져와짐
 */

/**
 * 테스트 시나리오 2: PDF 다운로드 기능
 *
 * 목표: PDF 다운로드 버튼 클릭 시 PDF 파일이 정상적으로 생성되고 다운로드되는지 확인
 *
 * 실행 순서:
 * 1. browser_navigate로 견적서 페이지 접근
 *    - URL: http://localhost:3000/invoice/[valid-notion-page-id]
 *
 * 2. browser_snapshot으로 페이지 로드 확인
 *
 * 3. browser_click 도구 사용
 *    - element: "PDF 다운로드 버튼"
 *    - ref: PDF 다운로드 버튼의 정확한 selector (snapshot에서 확인)
 *
 * 4. browser_wait_for 도구로 다운로드 완료 대기
 *    - 다운로드가 시작되었는지 확인
 *
 * 5. 다운로드된 파일 검증:
 *    - 파일명 형식: invoice-[견적서 번호].pdf
 *    - 파일 크기 > 0 (빈 파일이 아님)
 *
 * 검증 기준:
 * - ✅ PDF 다운로드 버튼 클릭 성공
 * - ✅ PDF 파일이 생성됨
 * - ✅ 파일명이 올바른 형식
 * - ✅ PDF에 한글이 올바르게 렌더링됨 (수동 확인 필요)
 */

/**
 * 테스트 시나리오 3: 404 에러 처리
 *
 * 목표: 존재하지 않는 견적서 ID로 접근 시 404 페이지가 정상적으로 표시되는지 확인
 *
 * 실행 순서:
 * 1. browser_navigate로 유효하지 않은 ID로 접근
 *    - URL: http://localhost:3000/invoice/00000000000000000000000000000000 (형식 오류 ID도 동일하게 404)
 *
 * 2. browser_snapshot으로 404 페이지 렌더링 확인
 *
 * 3. 404 페이지 요소 확인:
 *    - "404", "견적서를 찾을 수 없습니다" 텍스트 존재
 *    - "이용 안내 보기" 링크 존재 (클라이언트가 관리자 로그인으로 유도되지 않도록 "홈으로" 링크는 없음)
 *
 * 검증 기준:
 * - ✅ 404 페이지가 표시됨
 * - ✅ 에러 메시지가 사용자 친화적
 * - ✅ 이용 안내(/invoice/guide)로 가는 링크만 제공
 */

/**
 * 테스트 시나리오 4: 성능 테스트
 *
 * 목표: ROADMAP의 성공 지표 달성 확인
 * - 페이지 로드 시간 < 3초
 * - PDF 생성 시간 < 5초
 *
 * 실행 순서:
 *
 * 4-1. 페이지 로드 성능 측정:
 * 1. 시작 시간 기록 (Date.now())
 * 2. browser_navigate로 견적서 페이지 접근
 * 3. browser_wait_for로 페이지 완전 로드 대기
 *    - text: "PDF 다운로드" (마지막 요소가 렌더링될 때까지)
 * 4. 종료 시간 기록
 * 5. 소요 시간 계산 및 검증: < 3000ms
 *
 * 4-2. PDF 생성 성능 측정:
 * 1. 시작 시간 기록
 * 2. browser_click으로 PDF 다운로드 버튼 클릭
 * 3. 다운로드 완료 대기
 * 4. 종료 시간 기록
 * 5. 소요 시간 계산 및 검증: < 5000ms
 *
 * 검증 기준:
 * - ✅ 페이지 로드 시간 < 3초 (캐시 미적중 시)
 * - ✅ 페이지 로드 시간 < 1초 (캐시 적중 시)
 * - ✅ PDF 생성 시간 < 5초
 * - ✅ Rate Limiting 헤더 확인 (X-RateLimit-Remaining)
 */

/**
 * 테스트 시나리오 5: 캐싱 및 Request Deduplication 검증
 *
 * 목표: Notion 응답 캐시(unstable_cache 60초 + React cache)이 올바르게 작동하는지 확인
 *
 * 실행 순서:
 * 1. browser_network_requests 도구로 네트워크 요청 모니터링 시작
 *
 * 2. 첫 번째 견적서 페이지 접근
 *    - browser_navigate: /invoice/[valid-id]
 *    - Notion API 호출 발생 확인
 *
 * 3. 동일 페이지 재접근 (60초 이내)
 *    - browser_navigate: /invoice/[valid-id]
 *    - Notion API 호출이 발생하지 않음 (캐시 적중) 확인
 *
 * 4. browser_network_requests로 네트워크 요청 확인
 *    - Notion API 호출 횟수: 1회만
 *
 * 검증 기준:
 * - ✅ 캐시 적중 시 Notion API 호출 없음
 * - ✅ 페이지 로드 속도 개선 (캐시 적중 시)
 */

/**
 * 테스트 시나리오 6: Rate Limiting 검증
 *
 * 목표: /api 미들웨어 속도 제한(IP당 분당 10회)이 올바르게 작동하는지 확인
 *
 * 실행 순서:
 * 1. Postman 또는 curl로 /api/generate-pdf를 분당 10회 초과 호출
 *
 * 2. 11번째 요청에서 429 응답 확인
 *
 * 3. 응답 헤더 확인:
 *    - X-RateLimit-Limit: 10
 *    - X-RateLimit-Remaining: 0
 *    - Retry-After: [초 단위]
 *
 * 4. 1분 후 다시 요청하여 정상 응답 확인
 *
 * 5. /admin 경로에는 속도 제한 헤더(X-RateLimit-*)가 붙지 않음 확인
 *
 * 검증 기준:
 * - ✅ 분당 10회 제한 작동
 * - ✅ 429 응답 및 Retry-After 헤더 제공
 * - ✅ 윈도우 리셋 후 정상 요청 가능
 */

/**
 * 실행 방법:
 *
 * 1. 개발 서버 시작:
 *    ```bash
 *    npm run dev
 *    ```
 *
 * 2. Claude Code에서 Playwright MCP 도구 사용:
 *    - browser_navigate: 페이지 접근
 *    - browser_snapshot: 페이지 상태 확인
 *    - browser_click: 버튼 클릭
 *    - browser_wait_for: 요소/텍스트 대기
 *    - browser_network_requests: 네트워크 요청 모니터링
 *
 * 3. 각 시나리오를 순서대로 실행하여 검증
 *
 * 4. 결과 기록:
 *    - 각 시나리오 통과/실패 여부
 *    - 성능 지표 (페이지 로드 시간, PDF 생성 시간)
 *    - 발견된 이슈 및 개선 사항
 */

export {};
