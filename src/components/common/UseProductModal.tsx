import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { X, Search } from 'lucide-react';
import Modal from './Modal';
import type { Product, Order } from '../../types';
import { useProduct } from '../../api/products';
import db from '../../instant';

type UseProductModalProps = {
  isOpen: boolean;
  product: Product;
  onSubmit: () => void;
  onClose: () => void;
};

export const UseProductModal: React.FC<UseProductModalProps> = ({
  isOpen,
  product,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({ orderId: '', quantity: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders from InstantDB
  const { data: ordersData } = db.useQuery({
    Orders: {
      customer: {},
      posOperator: {},
      wigger: {},
    },
  });

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!ordersData?.Orders) return [];
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return ordersData.Orders as Order[];

    return (ordersData.Orders as Order[]).filter((order) => {
      const matchesId = order.id?.toLowerCase().includes(query) || 
                       order.orderNumber?.toLowerCase().includes(query);
      const matchesCustomer = order.customer?.fullName?.toLowerCase().includes(query);
      const matchesWigger = (order.wigger as any)?.name?.toLowerCase?.().includes(query) ||
                           order.wigger?.toString().toLowerCase().includes(query);
      const matchesDate = new Date(order.createdAt).toLocaleDateString().includes(query);

      return matchesId || matchesCustomer || matchesWigger || matchesDate;
    });
  }, [ordersData?.Orders, searchQuery]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedOrder || !selectedOrder.id) {
      newErrors.orderId = 'Please select an order';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.quantity > product.quantity) {
      newErrors.quantity = `Insufficient stock. Available: ${product.quantity}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await useProduct({
        productId: product.id,
        orderId: selectedOrder!.id,
        quantity: formData.quantity,
      });
      toast.success(`${formData.quantity} unit(s) of "${product.name}" used for order ${selectedOrder!.orderNumber}`);
      setFormData({ orderId: '', quantity: 1 });
      setSelectedOrder(null);
      setSearchQuery('');
      onSubmit();
      onClose();
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to use product';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ orderId: '', quantity: 1 });
    setSelectedOrder(null);
    setSearchQuery('');
    setErrors({});
    setIsDropdownOpen(false);
    onClose();
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setFormData({ ...formData, orderId: order.id });
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Use Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Info (Read-only) */}
        <div className="bg-zinc-50 p-3 rounded-md border border-zinc-200">
          <p className="text-sm text-zinc-600">Product</p>
          <p className="font-medium text-zinc-900">{product.name}</p>
          <p className="text-xs text-zinc-500 mt-1">Available: {product.quantity} unit(s)</p>
        </div>

        {/* Order Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Order <span className="text-red-500">*</span>
          </label>

          {selectedOrder ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-start">
              <div>
                <p className="font-medium text-blue-900">{selectedOrder.orderNumber}</p>
                <p className="text-sm text-blue-700">{selectedOrder.customer?.fullName}</p>
                <p className="text-xs text-blue-600">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-900 mt-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={isSubmitting}
                  placeholder="Search by order ID, customer, wigger, or date..."
                  className={`w-full pl-9 pr-3 py-2 border ${
                    errors.orderId ? 'border-red-500' : 'border-zinc-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100`}
                />
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-300 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                  {filteredOrders.length === 0 ? (
                    <div className="p-3 text-sm text-zinc-500 text-center">
                      {searchQuery ? 'No orders found' : 'Start typing to search'}
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => handleOrderSelect(order)}
                        className="w-full text-left p-3 hover:bg-zinc-50 border-b border-zinc-200 last:border-b-0 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-zinc-900">{order.orderNumber}</p>
                            <p className="text-sm text-zinc-600">{order.customer?.fullName}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-zinc-500">{formatDate(order.createdAt)}</p>
                            {order.wigger && (
                              <p className="text-zinc-400">
                                {typeof order.wigger === 'string' ? order.wigger : (order.wigger as any)?.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Close dropdown when clicking outside */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}
            </div>
          )}

          {errors.orderId && <p className="mt-1 text-sm text-red-500">{errors.orderId}</p>}
        </div>

        {/* Quantity Field */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Quantity to Use <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            disabled={isSubmitting}
            className={`block w-full px-3 py-2 border ${
              errors.quantity ? 'border-red-500' : 'border-zinc-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100`}
            placeholder="1"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !selectedOrder}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Using...' : 'Use Product'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-zinc-200 text-zinc-800 text-sm font-medium rounded-md hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
