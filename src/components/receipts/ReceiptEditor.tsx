import { useEffect, useState } from "react";
import { Plus, Send, Trash2, X } from "lucide-react";
import type {
  Customer,
  Receipt,
  ReceiptLineItem,
  SendReceiptRequest,
} from "../../types";
import { useCurrency } from "../../context/CurrencyContext";

const createBlankLine = (): ReceiptLineItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  amount: 0,
  discount: 0,
});

const toDateInputValue = (timestamp: number) => {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const dateInputToTimestamp = (value: string) =>
  new Date(`${value}T00:00:00`).getTime();

type FromProfile = {
  businessName: string;
  businessAddress: string;
};

type ReceiptEditorProps = {
  receipt: Receipt;
  customers: Customer[];
  defaultBusinessName: string;
  defaultBusinessAddress: string;
  isSubmitting: boolean;
  onSaveFrom: (profile: FromProfile) => Promise<void>;
  onSubmit: (request: SendReceiptRequest) => Promise<void>;
};

export default function ReceiptEditor({
  receipt,
  customers,
  defaultBusinessName,
  defaultBusinessAddress,
  isSubmitting,
  onSaveFrom,
  onSubmit,
}: ReceiptEditorProps) {
  const { currency, formatCurrency } = useCurrency();
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    createBlankLine(),
  ]);
  const [isEditingFrom, setIsEditingFrom] = useState(false);
  const [fromDraft, setFromDraft] = useState<FromProfile>({
    businessName: "",
    businessAddress: "",
  });
  const [isSavingFrom, setIsSavingFrom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedItems = Array.isArray(receipt.lineItems)
      ? receipt.lineItems
      : [];
    const initialBusinessName =
      receipt.status === "SENT" ? receipt.businessName : defaultBusinessName;
    const initialBusinessAddress =
      receipt.status === "SENT"
        ? receipt.businessAddress
        : defaultBusinessAddress;

    setBusinessName(initialBusinessName || "");
    setBusinessAddress(initialBusinessAddress || "");
    setCustomerId(receipt.customerId || receipt.customer?.id || "");
    setReceiptDate(
      toDateInputValue(
        receipt.status === "SENT" && receipt.receiptDate
          ? receipt.receiptDate
          : Date.now(),
      ),
    );
    setLineItems(savedItems.length > 0 ? savedItems : [createBlankLine()]);
    setErrors({});
  }, [receipt, defaultBusinessName, defaultBusinessAddress]);

  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId,
  );

  const rowTotal = (item: ReceiptLineItem) =>
    item.quantity * item.amount - item.discount;

  const total = lineItems.reduce((sum, item) => sum + rowTotal(item), 0);

  const updateLine = (
    lineId: string,
    field: keyof Omit<ReceiptLineItem, "id">,
    value: string,
  ) => {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== lineId) return item;
        return {
          ...item,
          [field]: field === "description" ? value : Number(value),
        };
      }),
    );
  };

  const removeLine = (lineId: string) => {
    setLineItems((current) => {
      const remaining = current.filter((item) => item.id !== lineId);
      return remaining.length > 0 ? remaining : [createBlankLine()];
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!receipt.receiptNumber) {
      nextErrors.receiptNumber = "A reserved receipt number is required.";
    }
    if (!businessName.trim()) {
      nextErrors.businessName = "Business name is required.";
    }
    if (!businessAddress.trim()) {
      nextErrors.businessAddress = "Business address is required.";
    }
    if (!receiptDate || Number.isNaN(dateInputToTimestamp(receiptDate))) {
      nextErrors.receiptDate = "A valid receipt date is required.";
    }
    if (!selectedCustomer) {
      nextErrors.customerId = "Select a customer.";
    } else if (!selectedCustomer.email?.trim()) {
      nextErrors.customerId = "The selected customer must have an email address.";
    }

    lineItems.forEach((item, index) => {
      const prefix = `line-${item.id}`;
      if (!item.description.trim()) {
        nextErrors[`${prefix}-description`] = `Line ${index + 1}: description is required.`;
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        nextErrors[`${prefix}-quantity`] = `Line ${index + 1}: quantity must be greater than zero.`;
      }
      if (!Number.isFinite(item.amount) || item.amount < 0) {
        nextErrors[`${prefix}-amount`] = `Line ${index + 1}: amount cannot be negative.`;
      }
      if (!Number.isFinite(item.discount) || item.discount < 0) {
        nextErrors[`${prefix}-discount`] = `Line ${index + 1}: discount cannot be negative.`;
      } else if (item.discount > item.quantity * item.amount) {
        nextErrors[`${prefix}-discount`] = `Line ${index + 1}: discount cannot exceed its gross amount.`;
      }
    });

    if (total < 0) {
      nextErrors.total = "Receipt total cannot be negative.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        userId: "",
        receiptDate: dateInputToTimestamp(receiptDate),
        businessName: businessName.trim(),
        businessAddress: businessAddress.trim(),
        customerId,
        currency,
        lineItems,
      });
    } catch {
      return;
    }
  };

  const openFromEditor = () => {
    setFromDraft({ businessName, businessAddress });
    setIsEditingFrom(true);
  };

  const saveFromProfile = async () => {
    if (!fromDraft.businessName.trim() || !fromDraft.businessAddress.trim()) {
      setErrors((current) => ({
        ...current,
        fromProfile: "Business name and address are required.",
      }));
      return;
    }

    setIsSavingFrom(true);
    try {
      const profile = {
        businessName: fromDraft.businessName.trim(),
        businessAddress: fromDraft.businessAddress.trim(),
      };
      await onSaveFrom(profile);
      setBusinessName(profile.businessName);
      setBusinessAddress(profile.businessAddress);
      setIsEditingFrom(false);
      setErrors((current) => ({ ...current, fromProfile: "" }));
    } catch {
      return;
    } finally {
      setIsSavingFrom(false);
    }
  };

  const inputClass =
    "mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <div className="border border-zinc-300 bg-white shadow-sm">
        <div className="grid gap-8 border-b border-zinc-200 p-5 sm:p-8 lg:grid-cols-[1fr_280px]">
          <section>
            <div className="mb-2 flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase text-zinc-500">From</p>
              <button
                type="button"
                onClick={openFromEditor}
                className="text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                Edit From
              </button>
            </div>
            <p className="text-lg font-semibold text-zinc-900">
              {businessName || "Business name not set"}
            </p>
            <p className="mt-1 max-w-xl whitespace-pre-line text-sm text-zinc-600">
              {businessAddress || "Business address not set"}
            </p>
            {(errors.businessName || errors.businessAddress) && (
              <p className="mt-2 text-sm text-red-600">
                {errors.businessName || errors.businessAddress}
              </p>
            )}

            <div className="mt-8 max-w-xl">
              <label htmlFor="receipt-customer" className="text-xs font-semibold uppercase text-zinc-500">
                To
              </label>
              <select
                id="receipt-customer"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className={inputClass}
              >
                <option value="">Select a customer</option>
                {customers
                  .slice()
                  .sort((a, b) => a.fullName.localeCompare(b.fullName))
                  .map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName} ({customer.email})
                    </option>
                  ))}
              </select>
              {selectedCustomer && (
                <div className="mt-3 text-sm text-zinc-600">
                  <p>{selectedCustomer.email}</p>
                  <p>{selectedCustomer.phoneNumber}</p>
                </div>
              )}
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <label htmlFor="receipt-number" className="text-xs font-semibold uppercase text-zinc-500">
                Receipt Number
              </label>
              <input
                id="receipt-number"
                value={receipt.receiptNumber || ""}
                readOnly
                className={`${inputClass} bg-zinc-100 font-semibold`}
              />
              {errors.receiptNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.receiptNumber}</p>
              )}
            </div>
            <div>
              <label htmlFor="receipt-date" className="text-xs font-semibold uppercase text-zinc-500">
                Date
              </label>
              <input
                id="receipt-date"
                type="date"
                value={receiptDate}
                onChange={(event) => setReceiptDate(event.target.value)}
                className={inputClass}
              />
              {errors.receiptDate && (
                <p className="mt-1 text-sm text-red-600">{errors.receiptDate}</p>
              )}
            </div>
          </section>
        </div>

        <div className="p-5 sm:p-8">
          <div className="hidden grid-cols-[minmax(260px,1fr)_110px_150px_150px_44px] gap-3 border-b border-zinc-300 pb-3 text-xs font-semibold uppercase text-zinc-500 md:grid">
            <span>Description</span>
            <span>Quantity</span>
            <span>Amount</span>
            <span>Discount</span>
            <span />
          </div>

          <div className="divide-y divide-zinc-200">
            {lineItems.map((item, index) => {
              const prefix = `line-${item.id}`;
              return (
                <div
                  key={item.id}
                  className="grid gap-3 py-5 md:grid-cols-[minmax(260px,1fr)_110px_150px_150px_44px]"
                >
                  <div>
                    <label className="text-xs font-semibold uppercase text-zinc-500 md:hidden">
                      Description
                    </label>
                    <textarea
                      aria-label={`Line ${index + 1} description`}
                      rows={3}
                      value={item.description}
                      onChange={(event) =>
                        updateLine(item.id, "description", event.target.value)
                      }
                      className={inputClass}
                    />
                    {errors[`${prefix}-description`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`${prefix}-description`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-zinc-500 md:hidden">
                      Quantity
                    </label>
                    <input
                      aria-label={`Line ${index + 1} quantity`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateLine(item.id, "quantity", event.target.value)
                      }
                      className={inputClass}
                    />
                    {errors[`${prefix}-quantity`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`${prefix}-quantity`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-zinc-500 md:hidden">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-3 text-sm text-zinc-500">
                        {currency}
                      </span>
                      <input
                        aria-label={`Line ${index + 1} amount`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(event) =>
                          updateLine(item.id, "amount", event.target.value)
                        }
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    {errors[`${prefix}-amount`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`${prefix}-amount`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-zinc-500 md:hidden">
                      Discount
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-3 text-sm text-zinc-500">
                        {currency}
                      </span>
                      <input
                        aria-label={`Line ${index + 1} discount`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(event) =>
                          updateLine(item.id, "discount", event.target.value)
                        }
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                    {errors[`${prefix}-discount`] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors[`${prefix}-discount`]}
                      </p>
                    )}
                    <p className="mt-2 text-right text-sm font-medium text-zinc-700">
                      {formatCurrency(rowTotal(item))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(item.id)}
                    className="mt-6 flex h-10 w-10 items-center justify-center text-zinc-500 hover:bg-red-50 hover:text-red-700 md:mt-1"
                    title="Remove line"
                    aria-label={`Remove line ${index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setLineItems((current) => [...current, createBlankLine()])}
            className="mt-3 inline-flex items-center gap-2 border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            <Plus size={17} />
            New Line
          </button>

          <div className="mt-8 flex justify-end border-t border-zinc-300 pt-6">
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between text-xl font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {errors.total && (
                <p className="mt-2 text-sm text-red-600">{errors.total}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />
                {isSubmitting
                  ? "Sending..."
                  : receipt.status === "SENT"
                    ? "Resend Receipt"
                    : "Send Receipt"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditingFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-from-title"
            className="w-full max-w-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="edit-from-title" className="text-xl font-semibold text-zinc-900">
                Edit From
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingFrom(false)}
                className="p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="from-business-name" className="block text-sm font-medium text-zinc-700">
                  Business Name
                </label>
                <input
                  id="from-business-name"
                  value={fromDraft.businessName}
                  onChange={(event) =>
                    setFromDraft((current) => ({
                      ...current,
                      businessName: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="from-business-address" className="block text-sm font-medium text-zinc-700">
                  Address
                </label>
                <textarea
                  id="from-business-address"
                  rows={5}
                  value={fromDraft.businessAddress}
                  onChange={(event) =>
                    setFromDraft((current) => ({
                      ...current,
                      businessAddress: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              {errors.fromProfile && (
                <p className="text-sm text-red-600">{errors.fromProfile}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingFrom(false)}
                disabled={isSavingFrom}
                className="border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveFromProfile}
                disabled={isSavingFrom}
                className="bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
              >
                {isSavingFrom ? "Saving..." : "Save From"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
