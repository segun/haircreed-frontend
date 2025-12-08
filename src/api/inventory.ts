import type { InventoryItem } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_INVENTORY_ENDPOINT}`

type InventoryItemPayload = {
    quantity: number;
    costPrice?: number;
    supplierId?: string;
    attributeIds: string[];
};

const getLoggedInUserId = (): string => {
    const stored = localStorage.getItem('user');
    if (!stored) throw new Error('No logged-in user found');
    try {
        const parsed = JSON.parse(stored);
        if (!parsed?.id) throw new Error('No user id in stored user');
        return parsed.id;
    } catch (err) {
        throw new Error('Failed to parse logged-in user from localStorage' + err);
    }
}

export const createInventoryItem = async (item: InventoryItemPayload): Promise<InventoryItem> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...item,
            userId: getLoggedInUserId(),
        }),
    });
    if (!response.ok) throw new Error('Failed to create inventory item');
    return response.json();
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItemPayload>): Promise<InventoryItem> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...item,
            userId: getLoggedInUserId(),
        }),
    });
    if (!response.ok) throw new Error('Failed to update inventory item');
    return response.json();
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}/${getLoggedInUserId()}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete inventory item');
    }
};