import React, { useState, useMemo, useEffect } from 'react';
import type { InventoryItem, InventoryItemWithDetails, User } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';

type InventoryItemTableProps = {
    items: InventoryItemWithDetails[] | undefined;
    onEdit: (item: InventoryItemWithDetails) => void;
    onDelete: (itemId: string) => void;
    user: User;
};

const InventoryItemTable: React.FC<InventoryItemTableProps> = ({ items, onEdit, onDelete, user }) => {
    const [itemToDelete, setItemToDelete] = useState<InventoryItemWithDetails | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const highlightMatch = (text: string | undefined, q: string) => {
        const s = text ?? '';
        if (!q) return s;
        const lower = s.toLowerCase();
        const ql = q.toLowerCase();
        const parts: React.ReactNode[] = [];
        let start = 0;
        let idx = lower.indexOf(ql, start);
        let key = 0;
        while (idx !== -1) {
            if (idx > start) parts.push(<span key={`t-${key++}`}>{s.substring(start, idx)}</span>);
            parts.push(
                <mark key={`m-${key++}`} className="bg-yellow-200 rounded">
                    {s.substring(idx, idx + ql.length)}
                </mark>
            );
            start = idx + ql.length;
            idx = lower.indexOf(ql, start);
        }
        if (start < s.length) parts.push(<span key={`t-${key++}`}>{s.substring(start)}</span>);
        return parts.length ? <>{parts}</> : s;
    };

    const handleDeleteClick = (item: InventoryItemWithDetails) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onDelete(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    const getInventoryItemName = (item: InventoryItem) => {
        if (!item.attributes || item.attributes.length === 0) return 'N/A';
        return item.attributes
            .map(attr => attr.category?.title ? `${attr.category.title}: ${attr.name}` : attr.name)
            .join(', ');
    };

    const filteredAndSortedItems = useMemo(() => {
        const list = (items ?? []).slice();
        const q = (debouncedQuery || '').toLowerCase();

        const filtered = q
            ? list.filter((item) => {
                  const name = getInventoryItemName(item).toLowerCase();
                  const supplier = (item.supplier?.name || '').toLowerCase();
                  const qty = String(item.quantity ?? '').toLowerCase();
                  const price = item.costPrice != null ? String(item.costPrice).toLowerCase() : '';
                  return (
                      name.includes(q) ||
                      supplier.includes(q) ||
                      qty.includes(q) ||
                      price.includes(q)
                  );
              })
            : list;

        return filtered.sort((a, b) => {
            const nameA = getInventoryItemName(a).toLowerCase();
            const nameB = getInventoryItemName(b).toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [items, debouncedQuery]);

    return (
        <>
            <div className="mb-4">
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attributes, supplier, qty, price..."
                    className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                {searchQuery && (
                    <p className="mt-1 text-xs text-zinc-500">Searching for "{searchQuery}" (debounced)</p>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Attributes</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Supplier</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-200">
                        {filteredAndSortedItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={item.quantity === 0 ? 'bg-red-100' : ''}
                                    >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{highlightMatch(getInventoryItemName(item), debouncedQuery)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{highlightMatch(String(item.quantity), debouncedQuery)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{highlightMatch(item.costPrice ? `$${item.costPrice.toFixed(2)}` : 'N/A', debouncedQuery)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{highlightMatch(item.supplier?.name || 'N/A', debouncedQuery)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
                                        <button onClick={() => onEdit(item as InventoryItemWithDetails)} className="text-zinc-600 hover:text-zinc-900">
                                            Edit
                                        </button>
                                    )}
                                    {user.role === "SUPER_ADMIN" && (
                                        <button onClick={() => handleDeleteClick(item)} className="ml-4 text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ConfirmDialog
                isOpen={!!itemToDelete}
                title="Delete Inventory Item"
                message={`Are you sure you want to delete this item? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                onClose={() => setItemToDelete(null)}
            />
        </>
    );
};

export default InventoryItemTable;