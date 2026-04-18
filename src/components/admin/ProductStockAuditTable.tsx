import React, { useState, useMemo, useEffect } from 'react';
import type { ProductStockAudit } from '../../types';

type ProductStockAuditTableProps = {
  audits: ProductStockAudit[] | undefined;
  isLoading?: boolean;
};

export const ProductStockAuditTable: React.FC<ProductStockAuditTableProps> = ({
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
          placeholder="Search by product name or added by user..."
          disabled={isLoading}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">When Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Quantity Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Before</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">After</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Added By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-zinc-500">
                  {isLoading ? 'Loading audits...' : 'No stock audits found'}
                </td>
              </tr>
            ) : (
              filteredItems.map((audit) => (
                <tr key={audit.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{audit.product?.name || audit.productId}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{formatDate(audit.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{audit.quantityAdded}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{audit.quantityBefore ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{audit.quantityAfter ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{audit.userFullname || audit.userId || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
