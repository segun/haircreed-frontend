import type { Order } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_ORDERS_ENDPOINT}`

type OrderPayload = {
    customerId: string;
    items: { id: string; name: string; quantity: number; price: number }[];
    status: 'CREATED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
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

export const updateOrder = async (orderId: string, userId: string, updates: Partial<Order>): Promise<Order> => {
    const response = await fetch(`${BASE_URL}/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({updates, userId}),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
}
