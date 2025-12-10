export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDP(total: number): number {
  return Math.ceil(total * 0.5);
}

export const TAX_RATE = 0.1; // 10%

export function calculateTax(subtotal: number): number {
  return Math.ceil(subtotal * TAX_RATE);
}

export function calculateTotalWithTax(subtotal: number): number {
  return subtotal + calculateTax(subtotal);
}

export interface OrderItemForMessage {
  menuName: string;
  quantity: number;
  selectedOptions?: string;
  subtotal: number;
}

export interface BookingDataForMessage {
  customerName: string;
  phone: string;
  instagram?: string;
  bookingDate: string;
  pax: number;
  seating: string;
  orderItems: OrderItemForMessage[];
  totalAmount: number;
  dpAmount: number;
  paymentProofUrl?: string;
}

export function formatWhatsAppMessage(data: BookingDataForMessage): string {
  const orderDetails = data.orderItems
    .map(
      (item) =>
        `• ${item.menuName} x${item.quantity}${
          item.selectedOptions ? ` (${item.selectedOptions})` : ""
        } - ${formatCurrency(item.subtotal)}`
    )
    .join("\n");

  const message = `
🌙 *BOOKING BUKA PUASA* 🌙

*DATA PEMESAN:*
📛 Nama: ${data.customerName}
📱 WhatsApp: ${data.phone}
📸 Instagram: ${data.instagram || "-"}
📅 Tanggal: ${data.bookingDate}
👥 Jumlah Orang: ${data.pax} pax
🪑 Spot Duduk: ${data.seating}

*PESANAN:*
${orderDetails}

💰 *TOTAL: ${formatCurrency(data.totalAmount)}*
💳 *DP (50%): ${formatCurrency(data.dpAmount)}*

${data.paymentProofUrl ? `📎 Bukti Pembayaran: ${data.paymentProofUrl}` : ""}

Terima kasih! 🙏
`.trim();

  return message;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  // Remove any non-numeric characters from phone
  const cleanPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
