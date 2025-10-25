/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import db from '../instant';
import type { Supplier, AttributeCategory, InventoryItemWithDetails } from '../types';
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../api/inventory';
import AdminLayout from '../components/layouts/AdminLayout';
import InventoryItemForm from '../components/admin/InventoryItemForm';
import InventoryItemTable from '../components/admin/InventoryItemTable';
import { createSupplier } from '../api/suppliers';
import Modal from '../components/common/Modal';
import SupplierForm from '../components/admin/SupplierForm';
import LoadingIndicator from '../components/common/LoadingIndicator';

const InventoryPage: React.FC<any> = ({ user, onLogout }) => {
    const { isLoading, error, data } = db.useQuery({
        InventoryItems: {
            attributes: { category: {} },
            supplier: {},
        },
        Suppliers: {},
        AttributeCategory: {
            items: {}
        }
    });

    const [editingItem, setEditingItem] = useState<InventoryItemWithDetails | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);
    const [writeError, setWriteError] = useState<string | null>(null);

    // Ensure supplier is always defined for each inventory item
    const inventoryItems = (data?.InventoryItems || []).map(item => ({
        ...item,
        supplier: item.supplier ?? {
            id: '',
            createdAt: 0,
            name: '',
            email: '',
            contactPerson: '',
            phoneNumber: '',
            address: '',
            notes: ''
        }
    })) as InventoryItemWithDetails[];
    const suppliers = data?.Suppliers || [];
    const attributeCategories = data?.AttributeCategory as AttributeCategory[] || [];

    const handleSave = async (payload: { id?: string; quantity: number; costPrice?: number; supplierId?: string; attributeIds: string[] }) => {
        setIsSubmitting(true);
        setWriteError(null);
        try {
            if (payload.id) {
                await updateInventoryItem(payload.id, payload);
            } else {
                await createInventoryItem(payload);
            }
            setIsFormOpen(false);
            setEditingItem(null);
        } catch (err) {
            setWriteError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddSupplier = async (supplierPayload: Omit<Supplier, 'id' | 'createdAt'>) => {
        setIsSubmittingSupplier(true);
        setWriteError(null);
        try {
            await createSupplier(supplierPayload);
            setIsSupplierModalOpen(false);
        } catch (err) {
            // This error will be displayed inside the modal
            setWriteError((err as Error).message);
            throw err; // re-throw to indicate failure to the form
        } finally {
            setIsSubmittingSupplier(false);
        }
    };

    const handleEdit = (item: InventoryItemWithDetails) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = async (itemId: string) => {
        setIsSubmitting(true);
        setWriteError(null);
        try {
            await deleteInventoryItem(itemId);
        } catch (err) {
            setWriteError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    return (
        <AdminLayout pageTitle="Inventory Management" user={user} onLogout={onLogout}>
            {(isSubmitting || isSubmittingSupplier) && <LoadingIndicator />}
            <Modal
                isOpen={isSupplierModalOpen}
                onClose={() => setIsSupplierModalOpen(false)}
                title="Add New Supplier"
            >
                <div className="mt-4">
                    {writeError && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mb-4">Error: {writeError}</p>}
                    <SupplierForm
                        onSave={handleAddSupplier}
                        onCancel={() => setIsSupplierModalOpen(false)}
                        isSubmitting={isSubmittingSupplier}
                    />
                </div>
            </Modal>

            <div className="p-4">
                <div className="flex justify-end items-center mb-4">
                    <button
                        onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                        className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-900"
                    >
                        Add Inventory Item
                    </button>
                </div>

                {(error || writeError) && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mb-4">Error: {error?.message || writeError}</p>}

                {isFormOpen && (
                    <div className="mb-8">
                        <InventoryItemForm
                            item={editingItem}
                            suppliers={suppliers}
                            attributeCategories={attributeCategories}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onAddSupplier={() => { setWriteError(null); setIsSupplierModalOpen(true); }}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}
                {isLoading ? <p>Loading inventory...</p> : <InventoryItemTable items={inventoryItems} onEdit={handleEdit} onDelete={handleDelete} />}
            </div>
        </AdminLayout>
    );
};

export default InventoryPage;