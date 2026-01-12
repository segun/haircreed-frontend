import React, { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { Customer } from "../../types";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingIndicator from "../common/LoadingIndicator";
import db from "../../instant";

type CustomerTableProps = {
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string) => void;
};

const ITEMS_PER_PAGE = 10;

// Smart pagination component that shows limited page numbers
const SmartPagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // Show all pages if total is 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Near the beginning: [1] 2 3 4 ... last
                for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
                    pages.push(i);
                }
                if (totalPages > 5) pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near the end: 1 ... (last-3) (last-2) (last-1) [last]
                pages.push("...");
                for (let i = Math.max(2, totalPages - 3); i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle: 1 ... (current-1) [current] (current+1) ... last
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex gap-1">
            {getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                            currentPage === page
                                ? "bg-zinc-600 text-white"
                                : "text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50"
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={index} className="px-3 py-1 text-sm text-zinc-400">
                        {page}
                    </span>
                )
            )}
        </div>
    );
};

const CustomerTable: React.FC<CustomerTableProps> = ({ onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);

    // Debounce search term to avoid excessive queries
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Build database query with filtering and pagination
    const query = {
        Customers: {
            addresses: {},
            $: {
                limit: ITEMS_PER_PAGE,
                offset: ITEMS_PER_PAGE * (currentPage - 1),
                ...(debouncedSearchTerm.trim() && {
                    where: {
                        or: [
                            { fullName: { $like: `%${debouncedSearchTerm}%` } },
                            { email: { $like: `%${debouncedSearchTerm}%` } },
                            { phoneNumber: { $like: `%${debouncedSearchTerm}%` } },
                            { headSize: { $like: `%${debouncedSearchTerm}%` } },
                        ],
                    },
                }),
            },
        },
    };

    const { data, isLoading, pageInfo } = db.useQuery(query);
    const customers = (data?.Customers || []) as Customer[];

    // Calculate total pages from pageInfo
    const totalItems = pageInfo?.Customers?.hasNextPage
        ? (currentPage + 1) * ITEMS_PER_PAGE // We don't know exact count, estimate
        : (currentPage - 1) * ITEMS_PER_PAGE + customers.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    // Reset to page 1 when search term changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
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
        // Use browser's default locale instead of hardcoding en-US
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + customers.length;

    return (
        <div className="bg-white rounded-lg shadow-md relative">
            {isLoading && <LoadingIndicator />}

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
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">
                                    {searchTerm ? "No customers found matching your search." : "No customers yet. Add your first customer to get started."}
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
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
                        Showing {startIndex + 1} to {endIndex} of {totalItems}+ customers
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
                        <SmartPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pageInfo?.Customers?.hasNextPage && currentPage === totalPages}
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
