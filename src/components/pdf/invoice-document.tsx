import path from "node:path";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/types/invoice";

// 한글 렌더링을 위한 나눔고딕 폰트 등록 (public/fonts)
const fontDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "NanumGothic",
  fonts: [
    { src: path.join(fontDir, "NanumGothic-Regular.ttf") },
    { src: path.join(fontDir, "NanumGothic-Bold.ttf"), fontWeight: "bold" },
  ],
});
// 한글 단어가 하이픈으로 잘리지 않도록 설정
Font.registerHyphenationCallback((word) => [word]);

const colors = {
  text: "#171717",
  muted: "#737373",
  border: "#e5e5e5",
  background: "#fafafa",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "NanumGothic",
    fontSize: 10,
    color: colors.text,
    padding: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  label: { fontSize: 9, color: colors.muted, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: "bold" },
  status: {
    fontSize: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    marginBottom: 24,
  },
  infoCell: { flex: 1 },
  infoValue: { fontSize: 11, fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  colName: { flex: 1 },
  colQty: { width: 50, textAlign: "right" },
  colPrice: { width: 110, textAlign: "right" },
  empty: { paddingVertical: 16, textAlign: "center", color: colors.muted },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: 16,
  },
  totalLabel: { fontSize: 11, marginRight: 16 },
  totalValue: { fontSize: 16, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
});

interface InvoiceDocumentProps {
  invoice: Invoice;
}

export function InvoiceDocument({ invoice }: InvoiceDocumentProps) {
  return (
    <Document title={`견적서 ${invoice.invoiceNumber}`} language="ko">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>견적서</Text>
            <Text style={styles.title}>{invoice.invoiceNumber}</Text>
          </View>
          {invoice.status && (
            <Text style={styles.status}>{invoice.status}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCell}>
            <Text style={styles.label}>클라이언트</Text>
            <Text style={styles.infoValue}>{invoice.clientName || "-"}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.label}>발행일</Text>
            <Text style={styles.infoValue}>
              {formatDate(invoice.issueDate)}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.label}>유효기간</Text>
            <Text style={styles.infoValue}>
              {formatDate(invoice.validUntil)}
            </Text>
          </View>
        </View>

        <View style={styles.tableHeader} fixed>
          <Text style={styles.colName}>항목명</Text>
          <Text style={styles.colQty}>수량</Text>
          <Text style={styles.colPrice}>단가</Text>
          <Text style={styles.colPrice}>금액</Text>
        </View>
        {invoice.items.length === 0 ? (
          <Text style={styles.empty}>등록된 견적 항목이 없습니다.</Text>
        ) : (
          invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.colPrice}>{formatCurrency(item.amount)}</Text>
            </View>
          ))
        )}

        <View style={styles.totalRow} wrap={false}>
          <Text style={styles.totalLabel}>총 금액</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.totalAmount)}
          </Text>
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${invoice.invoiceNumber} · ${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
