import type { InventoryItem } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_INVENTORY_ENDPOINT}`

type InventoryItemPayload = {
    quantity: number;
    costPrice?: number;
    supplierId?: string;
    attributeIds: string[];
};

export const createInventoryItem = async (item: InventoryItemPayload): Promise<InventoryItem> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to create inventory item');
    return response.json();
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItemPayload>): Promise<InventoryItem> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to update inventory item');
    return response.json();
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete inventory item');
    }
};