import type { AppSettings, Settings } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_APP_SETTINGS_ENDPOINT}`

export const createAppSettings = async (settings: Settings): Promise<AppSettings> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
    });
    if (!response.ok) throw new Error('Failed to create app settings');
    return response.json();
};

export const updateAppSettings = async (id: string, settings: Settings): Promise<AppSettings> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
    });
    if (!response.ok) throw new Error('Failed to update app settings');
    return response.json();
};