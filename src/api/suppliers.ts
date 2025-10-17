import type { Supplier } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_SUPPLIERS_ENDPOINT}`

export type SupplierPayload = Omit<Supplier, 'id' | 'createdAt'>;

export const createSupplier = async (supplier: SupplierPayload): Promise<Supplier> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || 'Failed to create supplier');
    }
    return response.json();
};