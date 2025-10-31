import React, { useState, useEffect } from 'react';
import type { InventoryItemWithDetails, Supplier, AttributeCategory } from '../../types';
import { PlusCircle, AlertCircle } from 'lucide-react';

type InventoryItemFormProps = {
    item: InventoryItemWithDetails | null;
    suppliers: Supplier[];
    attributeCategories: AttributeCategory[];
    onSave: (data: { id?: string; quantity: number; costPrice?: number; supplierId?: string; attributeIds: string[] }) => void;
    onCancel: () => void;
    onAddSupplier: () => void;
    isSubmitting: boolean;
};

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
    item,
    suppliers,
    attributeCategories,
    onSave,
    onCancel,
    onAddSupplier,
    isSubmitting,
}) => {
    const [quantity, setQuantity] = useState<number | ''>('');
    const [costPrice, setCostPrice] = useState<number | ''>('');
    const [supplierId, setSupplierId] = useState<string>('');
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (item) { // For editing
            setQuantity(item.quantity);
            setCostPrice(item.costPrice || '');
            setSupplierId(item.supplier?.id || '');

            const initialAttributes: Record<string, string> = {};
            item.attributes?.forEach((attr) => {
                const category = attributeCategories.find(cat =>
                    cat.items.some(catItem => catItem.id === attr.id)
                );
                if (category) {
                    initialAttributes[category.id] = attr.id;
                }
            });
            setSelectedAttributes(initialAttributes);
        } else { // For creating
            setQuantity('');
            setCostPrice('');
            setSupplierId('');
            setSelectedAttributes({});
        }
        setError(null); // Reset error on item change
    }, [item]);

    const handleAttributeChange = (categoryId: string, attributeId: string) => {
        setSelectedAttributes(prev => ({ ...prev, [categoryId]: attributeId }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const attributeIds = Object.values(selectedAttributes).filter(id => id);
        if (attributeIds.length === 0) {
            setError('At least one attribute must be selected.');
            return;
        }
        const payload = {
            id: item?.id || undefined,
            quantity: Number(quantity),
            costPrice: costPrice ? Number(costPrice) : undefined,
            supplierId: supplierId || undefined,
            attributeIds,
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-zinc-700">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="costPrice" className="block text-sm font-medium text-zinc-700">Cost Price (per unit)</label>
                    <input
                        type="number"
                        id="costPrice"
                        step="0.01"
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="supplierId" className="block text-sm font-medium text-zinc-700">Supplier</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <select
                            id="supplierId"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                        >
                            <option value="">Select a supplier</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button type="button" onClick={onAddSupplier} className="p-2 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-md" title="Add new supplier">
                            <PlusCircle size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6">
                {attributeCategories.map(category => (
                    <div key={category.id}>
                        <label htmlFor={`attr-${category.id}`} className="block text-sm font-medium text-zinc-700">{category.title}</label>
                        <select
                            id={`attr-${category.id}`}
                            value={selectedAttributes[category.id] || ''}
                            onChange={(e) => handleAttributeChange(category.id, e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                        >
                            <option value="">Select {category.title.toLowerCase()}</option>
                            {category.items.map(catItem => <option key={catItem.id} value={catItem.id}>{catItem.name}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Item'}
                </button>
            </div>
        </form>
    );
};

export default InventoryItemForm;