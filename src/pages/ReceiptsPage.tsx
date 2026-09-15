import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/layouts/AdminLayout";
import LoadingIndicator from "../components/common/LoadingIndicator";
import { useCurrency } from "../context/CurrencyContext";
import db from "../instant";
import type { Receipt, User } from "../types";

type ReceiptsPageProps = {
  user: User;
  onLogout: () => void;
};

const ITEMS_PER_PAGE = 10;

const dateInputToStart = (value: string) =>
  new Date(`${value}T00:00:00`).getTime();
const dateInputToEnd = (value: string) =>
  new Date(`${value}T23:59:59.999`).getTime();

export default function ReceiptsPage({ user, onLogout }: ReceiptsPageProps) {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { data, isLoading, error } = db.useQuery({ Receipts: {} });
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    receiptDate: "",
    dateStart: "",
    dateEnd: "",
    customer: "",
    receiptNumber: "",
  });

  const filteredReceipts = useMemo(() => {
    const customerQuery = filters.customer.trim().toLowerCase();
    const receiptNumberQuery = filters.receiptNumber.trim().toLowerCase();

    return ((data?.Receipts || []) as Receipt[])
      .filter((receipt) => receipt.status === "SENT")
      .filter((receipt) => {
        if (filters.receiptDate) {
          const start = dateInputToStart(filters.receiptDate);
          const end = dateInputToEnd(filters.receiptDate);
          if (receipt.receiptDate < start || receipt.receiptDate > end) return false;
        }
        if (
          filters.dateStart &&
          receipt.receiptDate < dateInputToStart(filters.dateStart)
        ) {
          return false;
        }
        if (
          filters.dateEnd &&
          receipt.receiptDate > dateInputToEnd(filters.dateEnd)
        ) {
          return false;
        }
        if (customerQuery) {
          const customerFields = [
            receipt.customerName,
            receipt.customerEmail,
            receipt.customerPhone,
          ];
          if (
            !customerFields.some((value) =>
              value.toLowerCase().includes(customerQuery),
            )
          ) {
            return false;
          }
        }
        if (
          receiptNumberQuery &&
          !String(receipt.receiptNumber)
            .toLowerCase()
            .includes(receiptNumberQuery)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.receiptDate - a.receiptDate);
  }, [data?.Receipts, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE),
  );
  const pageReceipts = filteredReceipts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const updateFilter = (name: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      receiptDate: "",
      dateStart: "",
      dateEnd: "",
      customer: "",
      receiptNumber: "",
    });
    setCurrentPage(1);
  };

  const openReceipt = (receiptId: string) => navigate(`/receipts/${receiptId}`);

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

  const inputClass =
    "mt-1 block w-full border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700";

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Receipts">
      {isLoading && <LoadingIndicator />}
      {error && (
        <p className="mb-4 bg-red-100 p-3 text-sm text-red-600">
          Error: {error.message}
        </p>
      )}

      <section className="mb-5 border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Search receipts</h2>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={16} />
            Clear filters
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-medium text-zinc-700">
            Receipt date
            <input
              type="date"
              value={filters.receiptDate}
              onChange={(event) => updateFilter("receiptDate", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Date from
            <input
              type="date"
              value={filters.dateStart}
              onChange={(event) => updateFilter("dateStart", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Date to
            <input
              type="date"
              value={filters.dateEnd}
              onChange={(event) => updateFilter("dateEnd", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Customer
            <input
              type="search"
              value={filters.customer}
              placeholder="Name, email, or phone"
              onChange={(event) => updateFilter("customer", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Receipt number
            <input
              type="search"
              value={filters.receiptNumber}
              placeholder="Receipt number"
              onChange={(event) =>
                updateFilter("receiptNumber", event.target.value)
              }
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                {[
                  "Receipt Number",
                  "Date",
                  "Customer",
                  "Email",
                  "Phone",
                  "Total",
                  "Last Sent",
                  "Sends",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {!isLoading && pageReceipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-zinc-500">
                    No receipts match these filters.
                  </td>
                </tr>
              )}
              {pageReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  tabIndex={0}
                  onClick={() => openReceipt(receipt.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openReceipt(receipt.id);
                    }
                  }}
                  className="cursor-pointer hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-zinc-700"
                >
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-zinc-900">
                    {receipt.receiptNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                    {new Date(receipt.receiptDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-800">
                    {receipt.customerName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                    {receipt.customerEmail}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                    {receipt.customerPhone}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-zinc-900">
                    {formatCurrency(receipt.totalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                    {receipt.resentAt || receipt.sentAt
                      ? new Date(
                          receipt.resentAt || receipt.sentAt || 0,
                        ).toLocaleString()
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">
                    {receipt.sendCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          {filteredReceipts.length} receipt{filteredReceipts.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
