const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PDF_ENDPOINT}`;

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptTotals {
  subtotal: number;
  vat: number;
  discountAmount: number;
  deliveryCharge: number;
  total: number;
}

export const downloadReceipt = async (orderId: string, items: ReceiptItem[], totals: ReceiptTotals) => {
  const response = await fetch(`${BASE_URL}/download/${orderId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, ...totals }),
  });

  if (!response.ok) {
    throw new Error('Failed to download receipt');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt_${orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
