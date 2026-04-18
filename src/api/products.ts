import type { Product, ProductStockAudit, ProductUsageAudit } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PRODUCTS_ENDPOINT}`;

const getLoggedInUserId = (): string => {
  const stored = localStorage.getItem('user');
  if (!stored) throw new Error('No logged-in user found');
  try {
    const parsed = JSON.parse(stored);
    if (!parsed?.id) throw new Error('No user id in stored user');
    return parsed.id;
  } catch (err) {
    throw new Error('Failed to parse logged-in user from localStorage');
  }
};

// Fetch all products
export const listProducts = async (): Promise<Product[]> => {
  const response = await fetch(BASE_URL);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

// Fetch single product
export const getProduct = async (id: string): Promise<Product> => {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
};

// Add a new product
export const createProduct = async (payload: { name: string; quantity: number }): Promise<Product> => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      quantity: payload.quantity,
      userId: getLoggedInUserId(),
      origin: 'WEB',
    }),
  });
  if (!response.ok) throw new Error('Failed to create product');
  return response.json();
};

// Add stock to an existing product
export const addStock = async (id: string, payload: { quantity: number }): Promise<Product> => {
  const response = await fetch(`${BASE_URL}/${id}/add-stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quantity: payload.quantity,
      userId: getLoggedInUserId(),
      origin: 'WEB',
    }),
  });
  if (!response.ok) throw new Error('Failed to add stock');
  return response.json();
};

// Use product (linked to order)
export const useProduct = async (payload: {
  productId: string;
  orderId: string;
  quantity: number;
}): Promise<Product> => {
  const response = await fetch(`${BASE_URL}/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: payload.productId,
      orderId: payload.orderId,
      quantity: payload.quantity,
      userId: getLoggedInUserId(),
      origin: 'WEB',
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 400 && error.message?.includes('quantity')) {
      throw new Error('Insufficient stock for this product');
    }
    if (response.status === 404) {
      throw new Error('Product or order not found');
    }
    throw new Error(error.message || 'Failed to use product');
  }
  return response.json();
};

// Update product name
export const updateProduct = async (id: string, payload: { name: string }): Promise<Product> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      userId: getLoggedInUserId(),
      origin: 'WEB',
    }),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 400 && error.message?.includes('quantity')) {
      throw new Error('This product cannot be deleted until quantity is zero');
    }
    throw new Error('Failed to delete product');
  }
};

// Fetch stock audit history
export const getStockAudits = async (productId?: string): Promise<ProductStockAudit[]> => {
  const params = productId ? `?productId=${productId}` : '';
  const response = await fetch(`${BASE_URL}/audits/stock${params}`);
  if (!response.ok) throw new Error('Failed to fetch stock audits');
  return response.json();
};

// Fetch usage audit history
export const getUsageAudits = async (filters?: {
  productId?: string;
  orderId?: string;
}): Promise<ProductUsageAudit[]> => {
  const params = new URLSearchParams();
  if (filters?.productId) params.append('productId', filters.productId);
  if (filters?.orderId) params.append('orderId', filters.orderId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${BASE_URL}/audits/usage${queryString}`);
  if (!response.ok) throw new Error('Failed to fetch usage audits');
  return response.json();
};
