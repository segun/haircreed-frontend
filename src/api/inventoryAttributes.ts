import type { AttributeCategory, AttributeItem } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_INVENTORY_ATTRIBUTES_ENDPOINT}`

// ---
// Attribute Categories
// ---

export const createCategory = async (title: string): Promise<AttributeCategory> => {
  const response = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to create category');
  return response.json();
};

export const updateCategory = async (categoryId: string, title: string): Promise<AttributeCategory> => {
  const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to update category');
  return response.json();
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete category');
};

// ---
// Attribute Items
// ---

export const createItem = async (categoryId: string, name: string): Promise<AttributeItem> => {
  const response = await fetch(`${BASE_URL}/categories/${categoryId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to create item');
  return response.json();
};

export const updateItem = async (itemId: string, name: string): Promise<AttributeItem> => {
  const response = await fetch(`${BASE_URL}/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to update item');
  return response.json();
};

export const deleteItem = async (itemId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete item');
};
