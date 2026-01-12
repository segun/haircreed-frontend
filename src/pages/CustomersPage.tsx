import React, { useState } from "react";
import type { User, Customer, CustomerAddress } from "../types";
import { createCustomer, deleteCustomer, updateCustomer } from "../api/customers";
import AdminLayout from "../components/layouts/AdminLayout";
import CustomerForm from "../components/admin/CustomerForm";
import CustomerTable from "../components/admin/CustomerTable";
import LoadingIndicator from "../components/common/LoadingIndicator";
import toast from "react-hot-toast";

type CustomersPageProps = {
    user: User;
    onLogout: () => void;
};

const CustomersPage: React.FC<CustomersPageProps> = ({ user, onLogout }: CustomersPageProps) => {
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveCustomer = async (customerData: Omit<Customer, "id" | "createdAt" | "orders" | "addresses"> & { id?: string; newAddress?: Partial<CustomerAddress> | null }) => {
        setIsSubmitting(true);
        try {
            const dataToSend = {
                ...customerData,
                newAddress: customerData.newAddress ?? null,
            };
            
            if (customerData.id) {
                await updateCustomer(customerData.id, dataToSend);
                toast.success("Customer updated successfully");
            } else {
                await createCustomer(dataToSend);
                toast.success("Customer created successfully");
            }
            setIsFormOpen(false);
            setEditingCustomer(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An error occurred";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleDeleteCustomer = async (customerId: string) => {
        setIsSubmitting(true);
        try {
            await deleteCustomer(customerId);
            toast.success("Customer deleted successfully");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete customer";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
    };

    // Access control: Only SUPER_ADMIN can access this page
    if (user.role !== "SUPER_ADMIN") {
        return (
            <AdminLayout user={user} onLogout={onLogout} pageTitle="Access Denied">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-zinc-800 mb-4">Access Denied</h2>
                    <p className="text-sm text-zinc-600">
                        You do not have permission to access Customer Management. This page is restricted to Super Administrators only.
                    </p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout pageTitle="Customers" user={user} onLogout={onLogout}>
            <div className="p-4 relative">
                {isSubmitting && <LoadingIndicator />}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800">Customer Management</h1>
                        <p className="text-sm text-zinc-600 mt-1">
                            Manage your customers
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCustomer(null);
                            setIsFormOpen(true);
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-900 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>+</span>
                        Add Customer
                    </button>
                </div>
                {isFormOpen && (
                    <div className="mb-6">
                        <CustomerForm
                            customer={editingCustomer}
                            onSave={handleSaveCustomer}
                            onCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}
                <CustomerTable
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                />
            </div>
        </AdminLayout>
    );
};

export default CustomersPage;
