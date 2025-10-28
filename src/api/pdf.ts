const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PDF_ENDPOINT}`;

export const downloadReceipt = async (orderId: string) => {
  const response = await fetch(`${BASE_URL}/download/${orderId}`, {
    method: 'GET',
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
