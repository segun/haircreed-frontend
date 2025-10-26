import type { User } from "../types";

export const login = async (username, password): Promise<User> => {
  const response = await fetch("http://localhost:3000/auth/login", {
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

  const data: User = await response.json();
  return data;
};
