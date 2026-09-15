import type { User } from "../types";
import type { AuthSession } from "./authSession";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_AUTH_ENDPOINT}`

export type LoginResult = {
  user: User;
  session: AuthSession;
};

type LoginApiResponse = Partial<User> & {
  user?: User;
  session: AuthSession;
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

  const data: LoginApiResponse = await response.json();
  const user = data.user ?? (data as User);

  if (!user.id || !data.session?.token || !data.session.expiresAt) {
    throw new Error("Login response did not include a valid user session.");
  }

  return { user, session: data.session };
};
