import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse, type NextRequest } from "next/server";

import { InvoiceDocument } from "@/components/pdf/invoice-document";
import { getInvoice } from "@/lib/services/invoice.service";

// react-pdf는 Node.js 런타임에서만 동작
export const runtime = "nodejs";

// GET /api/generate-pdf?id=[notionPageId] → 견적서 PDF 다운로드
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "견적서 ID가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const invoice = await getInvoice(id);
    if (!invoice) {
      return NextResponse.json(
        { error: "견적서를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} />);
    const fileName = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        // 한글 파일명을 위해 RFC 5987 형식 사용
        "Content-Disposition": `attachment; filename="invoice.pdf"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[generate-pdf] PDF 생성 실패:", error);
    return NextResponse.json(
      { error: "PDF 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
