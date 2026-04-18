import React, { useState, useMemo, useEffect } from 'react';
import type { ProductUsageAudit } from '../../types';

type ProductUsageAuditTableProps = {
  audits: ProductUsageAudit[] | undefined;
  isLoading?: boolean;
};

export const ProductUsageAuditTable: React.FC<ProductUsageAuditTableProps> = ({
  audits,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!audits) return [];
    const q = (debouncedQuery || '').toLowerCase();
    if (!q) return audits;
    return audits.filter(
      (a) =>
        a.product?.name.toLowerCase().includes(q) ||
        a.productId.toLowerCase().includes(q) ||
        a.order?.orderNumber?.toLowerCase().includes(q) ||
        a.orderId.toLowerCase().includes(q) ||
        a.userFullname?.toLowerCase().includes(q)
    );
  }, [audits, debouncedQuery]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product, order, or user..."
          disabled={isLoading}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Amount Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Used By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Used At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-zinc-500">
                  {isLoading ? 'Loading audits...' : 'No product usage audits found'}
                </td>
              </tr>
            ) : (
              filteredItems.map((audit) => (
                <tr key={audit.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{audit.product?.name || audit.productId}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 font-mono">{audit.order?.orderNumber || audit.orderId}</td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{audit.quantityUsed}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{audit.userFullname || audit.userId || '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{formatDate(audit.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
