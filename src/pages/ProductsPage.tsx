import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../components/layouts/AdminLayout';
import LoadingIndicator from '../components/common/LoadingIndicator';
import Modal from '../components/common/Modal';
import { ProductTable } from '../components/admin/ProductTable';
import { ProductForm } from '../components/admin/ProductForm';
import { UseProductModal } from '../components/common/UseProductModal';
import type { User, Product } from '../types';
import {
  listProducts,
  createProduct,
  addStock,
  updateProduct,
  deleteProduct,
} from '../api/products';

type PageProps = {
  user: User;
  onLogout: () => void;
};

type FormMode = 'add' | 'edit' | 'add-stock';

const ProductsPage: React.FC<PageProps> = ({ user, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('add');
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUseProductOpen, setIsUseProductOpen] = useState(false);
  const [selectedProductForUse, setSelectedProductForUse] = useState<Product | null>(null);

  // Role check: only SUPER_ADMIN and ADMIN can access
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return (
      <AdminLayout user={user} onLogout={onLogout} pageTitle="Products">
        <div className="text-center py-12">
          <p className="text-red-600">You do not have permission to access this page.</p>
        </div>
      </AdminLayout>
    );
  }

  // Fetch products on mount and when needed
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await listProducts();
      setProducts(data);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddClick = () => {
    setFormMode('add');
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setFormMode('edit');
    setEditingItem(product);
    setIsFormOpen(true);
  };

  const handleAddStockClick = (product: Product) => {
    setFormMode('add-stock');
    setEditingItem(product);
    setIsFormOpen(true);
  };

  const handleUseProductClick = (product: Product) => {
    setSelectedProductForUse(product);
    setIsUseProductOpen(true);
  };

  const handleFormSubmit = async (data: { name?: string; quantity: number }) => {
    setIsSubmitting(true);
    try {
      if (formMode === 'add') {
        await createProduct({ name: data.name!, quantity: data.quantity });
        toast.success('Product added successfully');
      } else if (formMode === 'edit' && editingItem) {
        await updateProduct(editingItem.id, { name: data.name! });
        toast.success('Product updated successfully');
      } else if (formMode === 'add-stock' && editingItem) {
        await addStock(editingItem.id, { quantity: data.quantity });
        toast.success('Stock added successfully');
      }
      await fetchProducts();
      setIsFormOpen(false);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (productId: string) => {
    try {
      setIsSubmitting(true);
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
      await fetchProducts();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseProductSubmit = async () => {
    // Refresh products after use to update quantity
    await fetchProducts();
  };

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Products">
      {isSubmitting && <LoadingIndicator />}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Products</h2>
          <p className="text-zinc-600 text-sm mt-1">Manage your product inventory and stock levels</p>
        </div>
        <button
          onClick={handleAddClick}
          disabled={isSubmitting || isLoading}
          className="px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-md hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          + Add Product
        </button>
      </div>

      <ProductTable
        products={products}
        isLoading={isLoading || isSubmitting}
        onEdit={handleEditClick}
        onAddStock={handleAddStockClick}
        onUseProduct={handleUseProductClick}
        onDelete={handleDeleteClick}
        user={user}
      />

      {/* Add/Edit/Add Stock Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          formMode === 'add'
            ? 'Add Product'
            : formMode === 'edit'
              ? 'Edit Product'
              : 'Add Stock'
        }
      >
        <ProductForm
          product={editingItem}
          mode={formMode}
          onSave={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Use Product Modal */}
      {selectedProductForUse && (
        <UseProductModal
          isOpen={isUseProductOpen}
          product={selectedProductForUse}
          onSubmit={handleUseProductSubmit}
          onClose={() => {
            setIsUseProductOpen(false);
            setSelectedProductForUse(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default ProductsPage;
