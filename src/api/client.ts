import { getAuthToken, invalidateAuthSession } from "./authSession";

export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type DataResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = DataResponse<T[]> & {
  pagination: Pagination;
};

export const apiUrl = (path: string, query?: Record<string, unknown>) => {
  const url = new URL(path, import.meta.env.VITE_API_BASE_URL);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

export const authorizedGet = async <T>(
  path: string,
  query?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(apiUrl(path, query), {
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (response.status === 401) invalidateAuthSession();

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};