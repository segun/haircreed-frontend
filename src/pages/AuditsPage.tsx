import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/layouts/AdminLayout';
import LoadingIndicator from '../components/common/LoadingIndicator';
import { ProductStockAuditTable } from '../components/admin/ProductStockAuditTable';
import { ProductUsageAuditTable } from '../components/admin/ProductUsageAuditTable';
import type { User, ProductStockAudit, ProductUsageAudit } from '../types';
import { getStockAudits, getUsageAudits } from '../api/products';

type PageProps = {
  user: User;
  onLogout: () => void;
};

const AuditsPage: React.FC<PageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'usage'>('stock');
  const [stockAudits, setStockAudits] = useState<ProductStockAudit[]>([]);
  const [usageAudits, setUsageAudits] = useState<ProductUsageAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Role check: only SUPER_ADMIN can access
  if (user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout user={user} onLogout={onLogout} pageTitle="Access Denied">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-zinc-800 mb-4">Access Denied</h2>
          <p className="text-sm text-zinc-600">You do not have permission to access Audits. This page is restricted to Super Administrators only.</p>
        </div>
      </AdminLayout>
    );
  }

  // Fetch audits on mount
  const fetchAudits = async () => {
    try {
      setIsLoading(true);
      const [stock, usage] = await Promise.all([
        getStockAudits(),
        getUsageAudits(),
      ]);
      setStockAudits(stock);
      setUsageAudits(usage);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to fetch audits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Product Audits">
      {isLoading && <LoadingIndicator />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">Product Audits</h2>
        <p className="text-zinc-600 text-sm mt-1">View complete history of stock additions and product usage</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 mb-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'stock'
              ? 'border-b-2 border-zinc-800 text-zinc-900'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          disabled={isLoading}
        >
          Stock Added
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'usage'
              ? 'border-b-2 border-zinc-800 text-zinc-900'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          disabled={isLoading}
        >
          Product Used
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'stock' && (
        <ProductStockAuditTable audits={stockAudits} isLoading={isLoading} />
      )}
      {activeTab === 'usage' && (
        <ProductUsageAuditTable audits={usageAudits} isLoading={isLoading} />
      )}
    </AdminLayout>
  );
};

export default AuditsPage;
