# Task 022: 링크 복사 로직 구현

## 개요

복사 버튼이 실제로 클라이언트용 절대 URL을 만들고, 브라우저 환경에 따라 Clipboard API → `execCommand` → 수동 복사 순으로 동작하게 한다(F021).

## 관련 파일

- `src/lib/invoice-url.ts` - `getAppOrigin`(환경 변수 우선, origin 폴백, 개발 시 경고), 끝 슬래시 정규화
- `src/hooks/use-copy-to-clipboard.ts` - 2단계 복사 + 2초 `copied` 상태
- `src/components/admin/copy-link-button.tsx` - `sonner` 성공·실패 토스트, 최종 실패 시 다이얼로그

## 수락 기준

- [x] 복사 값이 `<NEXT_PUBLIC_APP_URL 또는 origin>/invoice/<하이픈 없는 32자리 ID>`다
- [x] 복사한 URL을 비로그인 브라우저에서 열면 견적서가 보인다
- [x] 성공 시 "견적서 링크를 복사했습니다", 실패 시 실패 토스트가 표시된다
- [x] HTTP·권한 거부·구형 브라우저에서도 폴백 또는 수동 복사 UI가 제공된다

## 구현 단계

- [x] 1단계: `getAppOrigin` 구현
- [x] 2단계: `useCopyToClipboard` 훅 (보안 컨텍스트가 아니면 바로 `execCommand`로)
- [x] 3단계: 토스트·다이얼로그 연결

## 테스트 체크리스트

- [x] 테이블 첫 행 복사 → 성공 토스트, URL `/admin` 유지, 클립보드 값 형식 일치
- [x] 비로그인 컨텍스트에서 복사 URL 열기 → 견적서 표시, "목록으로" 없음
- [x] 375px 카드 버튼 40×40, 복사 후 이동 없음, 가로 스크롤 없음
- [x] 키보드 focus + Enter → 두 번째 견적서 링크 복사
- [x] `writeText` reject → `execCommand` 폴백으로 성공
- [x] `writeText` reject + `execCommand` 실패 → 실패 토스트 + 수동 복사 다이얼로그(URL 전체 선택)

## 변경 사항 요약

- `NEXT_PUBLIC_APP_URL` 미설정 시 개발 환경 콘솔에 경고를 남김
- `NEXT_PUBLIC_APP_URL`을 설정한 상태의 복사 값은 테스트하지 않음(로컬에 미설정)
