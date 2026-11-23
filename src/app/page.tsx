import { redirect } from "next/navigation";

import { ADMIN_HOME_PATH } from "@/lib/auth/constants";

// 관리자 화면은 /admin으로 분리됨 (클라이언트는 /invoice/[id] 링크로만 접근)
export default function HomePage() {
  redirect(ADMIN_HOME_PATH);
}
