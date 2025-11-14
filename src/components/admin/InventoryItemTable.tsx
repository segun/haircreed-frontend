import React, { useState } from 'react';
import type { InventoryItem, InventoryItemWithDetails } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';

type InventoryItemTableProps = {
    items: InventoryItemWithDetails[] | undefined;
    onEdit: (item: InventoryItemWithDetails) => void;
    onDelete: (itemId: string) => void;
};

const InventoryItemTable: React.FC<InventoryItemTableProps> = ({ items, onEdit, onDelete }) => {
    const [itemToDelete, setItemToDelete] = useState<InventoryItemWithDetails | null>(null);

    const handleDeleteClick = (item: InventoryItemWithDetails) => {
        setItemToDelete(item);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            onDelete(itemToDelete.id);
            setItemToDelete(null);
        }
    };

    const formatAttributes = (item: InventoryItem) => {
        if (!item.attributes || item.attributes.length === 0) return 'N/A';
        return item.attributes.map(attr => attr.name).join(', ') + " " +item.attributes[0].category.title;
    };

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Attributes</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Cost Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Supplier</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-200">
                        {(items ?? []).map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{formatAttributes(item)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{item.costPrice ? `$${item.costPrice.toFixed(2)}` : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{item.supplier?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(item as InventoryItemWithDetails)} className="text-zinc-600 hover:text-zinc-900">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteClick(item)} className="ml-4 text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
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