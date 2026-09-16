import type { InventoryItem } from "../types";
import { authorizedFetch } from "./client";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_INVENTORY_ENDPOINT}`

type InventoryItemPayload = {
    quantity: number;
    costPrice?: number;
    supplierId?: string;
    attributeIds: string[];
};

export const createInventoryItem = async (item: InventoryItemPayload, userId: string): Promise<InventoryItem> => {
    const response = await authorizedFetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...item,
            userId,
        }),
    });
    if (!response.ok) throw new Error('Failed to create inventory item');
    return response.json();
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItemPayload>, userId: string): Promise<InventoryItem> => {
    const response = await authorizedFetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...item,
            userId,
        }),
    });
    if (!response.ok) throw new Error('Failed to update inventory item');
    return response.json();
};

export const deleteInventoryItem = async (id: string, userId: string): Promise<void> => {
    const response = await authorizedFetch(`${BASE_URL}/${id}/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete inventory item');
    }
};