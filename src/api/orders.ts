import type { Order } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_ORDERS_ENDPOINT}`

type OrderPayload = {
    customerId: string;
    items: { id: string; name: string; quantity: number; price: number }[];
    status: 'CREATED' | 'IN PROGRESS' | 'COMPLETED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    notes?: string;
    wigger?: string;
    orderType: 'pickup' | 'delivery';
    deliveryCharge: number;
    discount: number;
    vat: number;
    orderNumber: string;
    totalAmount: number;
    vatRate: number;    
};

export const createOrder = async (order: OrderPayload): Promise<Order> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
};

type UpdateOrderPayload = {
    updates: Partial<Order>;
    userId: string;
    customerChanged?: boolean;
};

export const updateOrder = async (orderId: string, userId: string, updates: Partial<Order>, customerChanged?: boolean): Promise<Order> => {
    const payload: UpdateOrderPayload = {
        updates,
        userId,
        ...(customerChanged && { customerChanged }),
    };

    const response = await fetch(`${BASE_URL}/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update order: ${response.statusText}`);
    }
    return response.json();
}

export const deleteOrder = async (orderId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete order');
    }
}
