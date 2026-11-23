// 견적서 상태 (Notion `상태` Status 속성 옵션과 동일)
export const INVOICE_STATUSES = ["대기", "승인", "거절"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// 견적 항목 (Notion `Items` 데이터베이스)
export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 견적서 목록용 요약 정보 (Notion `Invoices` 데이터베이스)
export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string | null;
  validUntil: string | null;
  status: InvoiceStatus | null;
  // Notion `총 금액` (목록에서는 값이 없으면 null)
  totalAmount: number | null;
}

// 견적서 상세 (항목 포함, 총 금액은 항목 합계로 보완)
export interface Invoice extends Omit<InvoiceListItem, "totalAmount"> {
  totalAmount: number;
  items: InvoiceItem[];
}
