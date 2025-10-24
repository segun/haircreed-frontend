import type { CustomerAddress, User } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_CUSTOMERS_ENDPOINT}`

export const createCustomer = async (customer: Partial<User>): Promise<User> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
};

export const createCustomerAddress = async (address: Partial<CustomerAddress>): Promise<CustomerAddress> => {
    console.log('Creating address:', address);
    const response = await fetch(`${BASE_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
    });
    if (!response.ok) throw new Error('Failed to create customer address');
    return response.json();    
}


