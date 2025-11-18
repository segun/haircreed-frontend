import React, { useState, useMemo } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { Customer } from "../../types";
import ConfirmDialog from "../common/ConfirmDialog";

type CustomerTableProps = {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string) => void;
};

const ITEMS_PER_PAGE = 10;

const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);

    // Filter customers based on search term
    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) {
            return customers;
        }

        const lowerSearch = searchTerm.toLowerCase();
        return customers.filter(
            (customer) =>
                customer.fullName.toLowerCase().includes(lowerSearch) ||
                customer.email.toLowerCase().includes(lowerSearch) ||
                customer.phoneNumber.toLowerCase().includes(lowerSearch) ||
                (customer.headSize && customer.headSize.toLowerCase().includes(lowerSearch))
        );
    }, [customers, searchTerm]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    // Reset to page 1 when search term changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClick = (customerId: string) => {
        setDeleteCustomerId(customerId);
    };

    const handleConfirmDelete = () => {
        if (deleteCustomerId) {
            onDelete(deleteCustomerId);
            setDeleteCustomerId(null);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Search bar */}
            <div className="p-4 border-b border-zinc-200">
                <input
                    type="text"
                    placeholder="Search by name, email, phone, or head size..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Head Size
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Addresses
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {paginatedCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                                    {searchTerm ? "No customers found matching your search." : "No customers yet. Add your first customer to get started."}
                                </td>
                            </tr>
                        ) : (
                            paginatedCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-zinc-50">
                                    <td className="px-4 py-3 text-sm text-zinc-900 font-medium">
                                        {customer.fullName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600">
                                        {customer.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600">
                                        {customer.phoneNumber}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600">
                                        {customer.headSize || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600">
                                        {customer.addresses && customer.addresses.length > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-zinc-400" />
                                                <span>{customer.addresses.length} address{customer.addresses.length > 1 ? 'es' : ''}</span>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-zinc-600">
                                        {formatDate(customer.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onEdit(customer)}
                                                className="p-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded"
                                                title="Edit customer"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(customer.id)}
                                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                title="Delete customer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-between">
                    <div className="text-sm text-zinc-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                                        currentPage === page
                                            ? "bg-zinc-600 text-white"
                                            : "text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete confirmation dialog */}
            <ConfirmDialog
                isOpen={deleteCustomerId !== null}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteCustomerId(null)}
            />
        </div>
    );
};

export default CustomerTable;
