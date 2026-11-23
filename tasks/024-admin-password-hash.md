# Task 024: 관리자 해시 비밀번호 로그인

## 개요

배포 사이트에서 관리자 로그인을 쓰되, 비밀번호 원문은 관리자 본인만 알도록 평문 `ADMIN_PASSWORD` 대신 scrypt 해시와 세션 서명 키를 환경 변수로 쓴다(F023).

## 관련 파일

- `src/lib/auth/password-hash.ts` - scrypt 해시 생성·검증 (형식 `scrypt:N:r:p:salt:hash`, `.env` 변수 확장과 충돌하지 않도록 `$` 미사용)
- `scripts/hash-password.mjs`, `package.json` - `npm run hash-password` (입력 숨김, 확인 입력)
- `src/lib/env.ts` - `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `getAdminAuthConfig`
- `src/lib/auth/session.ts` - 해시 검증, `SESSION_SECRET`+해시 서명 키, `isAdminLoginConfigured`
- `src/components/admin/admin-password-notice.tsx` - 배포용·로컬용 설정 안내
- `src/lib/rate-limiter.ts`, `src/lib/request-ip.ts`, `src/lib/auth/login-rate-limit.ts` - 요청 제한·IP 조회 공용화
- `.env.example` - 새 환경 변수 문서화

## 수락 기준

- [x] `npm run hash-password`가 비밀번호를 화면에 표시하지 않고 해시와 세션 서명 키를 출력한다
- [x] 해시 + 32자 이상 `SESSION_SECRET`이 있으면 해시로 로그인하고 평문 `ADMIN_PASSWORD`는 무시한다
- [x] 세션 쿠키 서명 키에 `SESSION_SECRET`이 포함돼 해시만으로는 쿠키를 위조할 수 없다
- [x] 로컬에서는 평문 `ADMIN_PASSWORD`로 계속 로그인할 수 있다

## 구현 단계

- [x] 1단계: 해시 유틸과 생성 스크립트
- [x] 2단계: 환경 변수 스키마·인증 설정 우선순위
- [x] 3단계: 세션 서명·검증 교체, 안내 화면 갱신

## 테스트 체크리스트

- [x] 스크립트 출력 해시가 맞는 비밀번호는 통과, 틀린 비밀번호는 거부(Node scrypt로 교차 검증)
- [x] 8자 미만 비밀번호는 스크립트가 종료 코드 1로 거부
- [x] 테스트 해시로 실행한 서버에서 해시 비밀번호 로그인 성공, `.env.local`의 평문 비밀번호는 거부
- [x] 배포 사이트에서 관리자가 직접 설정한 해시로 로그인(사용자 확인)

## 변경 사항 요약

- 해시가 설정되면 평문보다 우선하며, 비밀번호를 바꾸면 서명 키가 바뀌어 기존 세션이 모두 무효화된다
- 해시·`SESSION_SECRET` 값이 노출되면 `npm run hash-password`로 다시 생성해 교체해야 한다
