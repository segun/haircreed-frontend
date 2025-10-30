import type { User } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_USERS_ENDPOINT}`

export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Failed to create user');
    }
    return response.json();
}

export const updateUser = async (userId: string, user: Partial<User>): Promise<User> => {
    const response = await fetch(`${BASE_URL}/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    return response.json();
}

export const deleteUser = async (userId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${userId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
}

export const updateUserSettings = async (
    userId: string, 
    updates: { fullName?: string; username?: string; newPassword?: string }, 
    currentPassword: string
): Promise<User> => {
    const response = await fetch(`${BASE_URL}/${userId}/settings`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...updates,
            currentPassword,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user settings');
    }
    return response.json();
}
