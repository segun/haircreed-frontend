import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';

type ProductFormProps = {
  product: Product | null;
  mode: 'add' | 'edit' | 'add-stock';
  onSave: (data: { name?: string; quantity: number }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  mode,
  onSave,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({ name: '', quantity: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'add') {
      setFormData({ name: '', quantity: 0 });
    } else if (mode === 'edit' && product) {
      setFormData({ name: product.name, quantity: product.quantity });
    } else if (mode === 'add-stock' && product) {
      setFormData({ name: product.name, quantity: 0 });
    }
    setErrors({});
  }, [product, mode]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode !== 'add-stock' && !formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (mode === 'add' && formData.quantity < 0) {
      newErrors.quantity = 'Initial quantity cannot be negative';
    } else if (mode === 'add-stock' && formData.quantity < 1) {
      newErrors.quantity = 'Stock to add must be at least 1';
    } else if (mode === 'edit' && formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'add-stock') {
        await onSave({ quantity: formData.quantity });
      } else if (mode === 'edit') {
        await onSave({ name: formData.name, quantity: formData.quantity });
      } else {
        // add mode
        await onSave({ name: formData.name, quantity: formData.quantity });
      }
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const getNameLabel = () => {
    switch (mode) {
      case 'add-stock':
        return `Product: ${product?.name || ''}`;
      default:
        return 'Product Name';
    }
  };

  const getQuantityLabel = () => {
    switch (mode) {
      case 'add':
        return 'Initial Quantity';
      case 'add-stock':
        return 'Quantity to Add';
      default:
        return 'Quantity';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field (hidden in add-stock mode) */}
      {(mode === 'add' || mode === 'edit') && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            {getNameLabel()} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isSubmitting}
            className={`block w-full px-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-zinc-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100`}
            placeholder="e.g., Shampoo XL"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
      )}

      {/* Quantity Field */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          {getQuantityLabel()} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={mode === 'add-stock' ? '1' : '0'}
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          disabled={isSubmitting}
          className={`block w-full px-3 py-2 border ${
            errors.quantity ? 'border-red-500' : 'border-zinc-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100`}
          placeholder="0"
        />
        {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-md hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-zinc-200 text-zinc-800 text-sm font-medium rounded-md hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
