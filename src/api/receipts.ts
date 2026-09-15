import type { Receipt, ReceiptDraftRequest, SendReceiptRequest } from "../types";
import { getAuthToken, invalidateAuthSession } from "./authSession";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_RECEIPTS_ENDPOINT}`;

const getErrorMessage = async (response: Response, fallback: string) => {
  const error = await response.json().catch(() => null);
  return error?.message || fallback;
};

const getAuthorizedHeaders = (idempotencyKey?: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
  ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
});

const handleUnauthorized = (response: Response) => {
  if (response.status === 401) {
    invalidateAuthSession();
  }
};

export const getOrCreateReceiptDraft = async (
  request: ReceiptDraftRequest,
): Promise<Receipt> => {
  const response = await fetch(`${BASE_URL}/drafts`, {
    method: "POST",
    headers: getAuthorizedHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error(
      await getErrorMessage(response, "Failed to prepare receipt"),
    );
  }

  return response.json();
};

const getDownloadFilename = (response: Response, receiptNumber: number) => {
  const disposition = response.headers.get("Content-Disposition");
  const encodedMatch = disposition?.match(/filename\*=UTF-8''([^;]+)/i);
  const basicMatch = disposition?.match(/filename="?([^";]+)"?/i);

  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1]);
  }

  return basicMatch?.[1] || `receipt_${receiptNumber}.pdf`;
};

export const sendReceipt = async (
  receiptId: string,
  receiptNumber: number,
  request: SendReceiptRequest,
) => {
  const response = await fetch(`${BASE_URL}/${receiptId}/send`, {
    method: "POST",
    headers: getAuthorizedHeaders(crypto.randomUUID()),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    handleUnauthorized(response);
    throw new Error(await getErrorMessage(response, "Failed to send receipt"));
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = getDownloadFilename(response, receiptNumber);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};
