import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../components/layouts/AdminLayout";
import LoadingIndicator from "../components/common/LoadingIndicator";
import ReceiptEditor from "../components/receipts/ReceiptEditor";
import db from "../instant";
import { updateAppSettings } from "../api/appSettings";
import { sendReceipt } from "../api/receipts";
import type {
  Customer,
  Receipt,
  SendReceiptRequest,
  Settings,
  User,
} from "../types";

type ReceiptEditorPageProps = {
  user: User;
  onLogout: () => void;
};

type LocationState = {
  receipt?: Receipt;
};

export default function ReceiptEditorPage({
  user,
  onLogout,
}: ReceiptEditorPageProps) {
  const { receiptId = "" } = useParams();
  const location = useLocation();
  const locationReceipt = (location.state as LocationState | null)?.receipt;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = db.useQuery({
    Receipts: {
      $: { where: { id: receiptId } },
      customer: { addresses: {} },
      order: {},
    },
    Customers: { addresses: {} },
    AppSettings: {},
  });

  if (user.role !== "SUPER_ADMIN") {
    return (
      <AdminLayout user={user} onLogout={onLogout} pageTitle="Access Denied">
        <div className="bg-white p-6 shadow-sm">
          <p className="text-red-600">
            You do not have permission to access receipts.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const receipt = (data?.Receipts?.[0] as Receipt | undefined) ||
    (locationReceipt?.id === receiptId ? locationReceipt : undefined);
  const customers = (data?.Customers || []) as Customer[];
  const appSettings = data?.AppSettings?.[0];
  const settings = (appSettings?.settings || {}) as Settings;

  const handleSaveFrom = async (profile: {
    businessName: string;
    businessAddress: string;
  }) => {
    if (!appSettings) {
      throw new Error("App settings must be created before editing From details.");
    }

    try {
      await updateAppSettings(appSettings.id, { ...settings, ...profile });
      toast.success("From details saved");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save From details",
      );
      throw saveError;
    }
  };

  const handleSubmit = async (request: SendReceiptRequest) => {
    if (!receipt) return;

    setIsSubmitting(true);
    try {
      await sendReceipt(receipt.id, receipt.receiptNumber, {
        ...request,
        userId: user.id,
      });
      toast.success(
        receipt.status === "SENT"
          ? "Receipt resent and downloaded"
          : "Receipt sent and downloaded",
      );
    } catch (sendError) {
      toast.error(
        sendError instanceof Error
          ? sendError.message
          : "Failed to send receipt",
      );
      throw sendError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Receipt">
      {(isLoading || isSubmitting) && <LoadingIndicator />}
      {error && (
        <p className="mb-4 bg-red-100 p-3 text-sm text-red-600">
          Error: {error.message}
        </p>
      )}
      {!isLoading && !receipt && !error && (
        <div className="bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Receipt not found.
        </div>
      )}
      {receipt && (
        <ReceiptEditor
          receipt={receipt}
          customers={customers}
          defaultBusinessName={settings.businessName || ""}
          defaultBusinessAddress={settings.businessAddress || ""}
          isSubmitting={isSubmitting}
          onSaveFrom={handleSaveFrom}
          onSubmit={handleSubmit}
        />
      )}
    </AdminLayout>
  );
}
