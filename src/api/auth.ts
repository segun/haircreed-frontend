import type { User } from "../types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_AUTH_ENDPOINT}`

export type LoginResult = {
  user: User;
  accessToken: string;
  expiresIn: number;
};

type LoginApiResponse = User & {
  accessToken: string;
  expiresIn: number;
};

export const login = async (username: string, password: string): Promise<LoginResult> => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error: ${response.statusText}`);
  }

  const data = await response.json() as LoginApiResponse;

  if (!data.id || !data.accessToken || !Number.isFinite(data.expiresIn) || data.expiresIn <= 0) {
    throw new Error("Login response did not include valid credentials.");
  }

  const { accessToken, expiresIn, ...user } = data;
  return { user, accessToken, expiresIn };
};
