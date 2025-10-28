import type { DashboardDetails } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_DASHBOARD_ENDPOINT}`

export const getDashboardDetails = async (): Promise<DashboardDetails> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch dashboard details');
    return response.json();
};