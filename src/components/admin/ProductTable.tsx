import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Edit2, Plus, ShoppingCart } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import type { Product, User } from '../../types';

type ProductTableProps = {
  products: Product[] | undefined;
  isLoading?: boolean;
  onEdit: (product: Product) => void;
  onAddStock: (product: Product) => void;
  onUseProduct: (product: Product) => void;
  onDelete: (productId: string) => void;
  user: User;
};

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading = false,
  onEdit,
  onAddStock,
  onUseProduct,
  onDelete,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!products) return [];
    const q = (debouncedQuery || '').toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  }, [products, debouncedQuery]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleDeleteClick = (product: Product) => {
    setItemToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name or ID..."
          disabled={isLoading}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 bg-white rounded-lg shadow-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Date Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Added By</th>
              <th className="relative px-6 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-zinc-500">
                  {isLoading ? 'Loading products...' : 'No products found'}
                </td>
              </tr>
            ) : (
              filteredItems.map((product) => {
                const isLowStock = product.quantity < 5;
                return (
                  <tr 
                    key={product.id} 
                    className={`transition-colors ${
                      isLowStock 
                        ? 'bg-red-50 hover:bg-red-100' 
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-zinc-600">{product.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">{product.name}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${
                      isLowStock 
                        ? 'text-red-700 bg-red-100 rounded' 
                        : 'text-zinc-500'
                    }`}>
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{formatDate(product.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{product.addedByUserFullname || product.addedByUserId || '—'}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    {isSuperAdmin && (
                      <button
                        onClick={() => onEdit(product)}
                        disabled={isLoading}
                        className="text-zinc-600 hover:text-zinc-900 disabled:text-zinc-300"
                        title="Edit product name"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onAddStock(product)}
                      disabled={isLoading}
                      className="text-zinc-600 hover:text-zinc-900 disabled:text-zinc-300"
                      title="Add stock"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => onUseProduct(product)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-900 disabled:text-blue-300"
                      title="Use product in order"
                    >
                      <ShoppingCart size={16} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteClick(product)}
                        disabled={isLoading || product.quantity > 0}
                        className={`${
                          product.quantity > 0
                            ? 'text-zinc-300 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900 disabled:text-red-300'
                        }`}
                        title={product.quantity > 0 ? 'Cannot delete: quantity must be zero' : 'Delete product'}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        title="Delete Product"
        message={itemToDelete ? `Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.` : ''}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </>
  );};
