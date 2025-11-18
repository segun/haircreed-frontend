import type { Customer, CustomerAddress } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_CUSTOMERS_ENDPOINT}`

export const createCustomer = async (customer: Partial<Customer> & {newAddress: Partial<CustomerAddress> | null}): Promise<Customer> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
};


export const updateCustomer = async (customerId: string, customer: Partial<Customer> & {newAddress: Partial<CustomerAddress> | null; addressChanged?: boolean; updatedAddresses?: Partial<CustomerAddress>[] | null}): Promise<Customer> => {
    const response = await fetch(`${BASE_URL}/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
};

export const deleteCustomer = async (customerId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${customerId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete customer');
};
