# Task 026: 신고하기 및 신고 관리

## 개요

클라이언트가 견적서 화면 상단의 "신고하기"로 신고를 작성하고 "내 신고 조회"로 처리 상태와 답변을 확인한다. 관리자는 "신고 관리"에서 신고를 접수하고 답변을 등록해 처리완료한다(F024). 상태 흐름은 작성 → 접수 → 처리완료다.

## 관련 파일

- `scripts/setup-report-db.mjs`, `package.json` - `npm run setup:report-db -- <페이지 URL>`로 Notion 신고 DB 생성
- `src/types/report.ts`, `src/lib/validations/report.ts` - 상태·타입, 작성·조회·답변 Zod 스키마
- `src/lib/services/report.service.ts` - 신고 생성(번호 `RPT-YYMMDD-XXXX`)·조회·목록·접수·답변
- `src/lib/notion/retry.ts` - Notion 429 재시도 공용화
- `src/app/report/` - 신고하기·내 신고 조회 페이지, 레이아웃, 서버 액션(IP별 요청 제한)
- `src/components/report/` - 폼, 조회, 상세 카드(진행 단계), 상태 배지, 준비 중 안내
- `src/components/layout/public-header.tsx`, `src/lib/return-path.ts` - 상단 바 버튼, `?from=` 돌아가기
- `src/app/(admin)/admin/(dashboard)/reports/` - 신고 목록·상세·로딩, 관리자 서버 액션
- `src/components/admin/admin-nav.tsx`, `report-list.tsx`, `report-admin-panel.tsx` - 메뉴, 목록, 접수·답변 패널

## 수락 기준

- [x] 견적서·이용 안내 상단에 "신고하기"·"내 신고 조회" 버튼이 있다
- [x] 제목·내용·조회 비밀번호로 신고하고, 완료 후 신고 번호와 작성 내용을 본다
- [x] 신고 번호 + 조회 비밀번호로 진행 단계와 답변을 본다
- [x] 신고 화면에서 원래 견적서로 돌아갈 수 있다
- [x] 관리자가 "접수"를 누르면 접수, 답변을 등록하면 처리완료가 된다
- [x] 상태 전환 규칙을 서버에서 검증한다
- [x] 조회 비밀번호는 해시로만 저장한다

## 구현 단계

- [x] 1단계: 타입·검증 스키마·신고 서비스
- [x] 2단계: 신고자 화면(작성·조회)과 상단 바
- [x] 3단계: 관리자 메뉴·목록·상세·접수/답변
- [x] 4단계: Notion 신고 DB 생성(공유받은 "신고하기" 페이지 하위)과 `.env.local` 설정
- [x] 5단계: 신고 화면 돌아가기(`?from=`)

## 테스트 체크리스트

- [x] 빈 제출 시 검증 메시지
- [x] 375px에서 신고 등록 → 신고 번호·상태 "작성" 표시
- [x] 내 신고 조회: 번호 미리 채움, 틀린 비밀번호 거부, 맞으면 상세 표시
- [x] 관리자 목록 필터 건수(전체 1 / 접수 1) → 상세에서 답변 칸 표시, 접수 버튼 사라짐
- [x] 신고자 화면 "접수" 상태와 안내 문구
- [x] 빈 답변 검증 → 답변 등록 → 관리자·신고자 화면 "처리완료" + 답변 표시, 필터 건수(처리완료 1)
- [x] 신고 화면 "돌아가기" → 원래 견적서, `?from=/admin`은 돌아가기 링크 없음
- [x] 375px 가로 스크롤 없음, 콘솔 오류 없음
- [ ] 신고 작성 5건 초과·조회 실패 10회 초과 차단 — 미실행(메모리 기반이라 서버 재시작 필요)

## 변경 사항 요약

- 신고 DB `Reports`는 공유받은 Notion "신고하기" 페이지 아래 인라인 DB로 생성됨
- 테스트로 만든 신고 `RPT-261123-TX3U`가 Notion 신고 DB에 남아 있음(필요 없으면 Notion에서 삭제)
- 배포 사이트에서 쓰려면 Vercel에 `NOTION_REPORT_DATABASE_ID`를 추가하고 재배포해야 함
