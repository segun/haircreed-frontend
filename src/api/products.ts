import type { Product, ProductStockAudit, ProductUsageAudit } from "../types";
import { authorizedGet, type DataResponse, type PaginatedResponse } from "./client";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PRODUCTS_ENDPOINT}`;

const getLoggedInUserId = (): string => {
  const stored = localStorage.getItem('user');
  if (!stored) throw new Error('No logged-in user found');
  try {
    const parsed = JSON.parse(stored);
    if (!parsed?.id) throw new Error('No user id in stored user');
    return parsed.id;
  } catch {
    throw new Error('Failed to parse logged-in user from localStorage');
  }
};

// Fetch all products
export const listProducts = async (): Promise<Product[]> => {
  const response = await authorizedGet<PaginatedResponse<Product>>(
    "/api/v1/products",
    { pageSize: 100, sort: "name:asc" },
  );
  return response.data;
};

// Fetch single product
export const getProduct = async (id: string): Promise<Product> => {
  const response = await authorizedGet<DataResponse<Product>>(
    `/api/v1/products/${encodeURIComponent(id)}`,
  );
  return response.data;
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

// Use product (optionally linked to an order)
export const useProduct = async (payload: {
  productId: string;
  orderId?: string;
  quantity: number;
}): Promise<Product> => {
  const requestBody: Record<string, string | number> = {
    productId: payload.productId,
    quantity: payload.quantity,
    userId: getLoggedInUserId(),
    origin: 'WEB',
  };

  if (payload.orderId) {
    requestBody.orderId = payload.orderId;
  }

  const response = await fetch(`${BASE_URL}/use`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
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
  const response = await authorizedGet<DataResponse<ProductStockAudit[]>>(
    "/api/v1/products/audits/stock",
    { productId },
  );
  return response.data;
};

// Fetch usage audit history
export const getUsageAudits = async (filters?: {
  productId?: string;
  orderId?: string;
}): Promise<ProductUsageAudit[]> => {
  const response = await authorizedGet<DataResponse<ProductUsageAudit[]>>(
    "/api/v1/products/audits/usage",
    filters,
  );
  return response.data;
};
