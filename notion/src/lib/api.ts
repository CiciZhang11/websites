// API client functions for frontend

const API_BASE = "/api";

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

// Pages API
export const pagesAPI = {
  list: () => fetchAPI<{ pages: any[] }>("/pages"),
  get: (id: string) => fetchAPI<{ page: any }>(`/pages/${id}`),
  create: (data: { title: string; parentId?: string; icon?: string }) =>
    fetchAPI<{ page: any }>("/pages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ title: string; icon: string; parentId: string }>) =>
    fetchAPI<{ page: any }>(`/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/pages/${id}`, {
      method: "DELETE",
    }),
  reorder: (updates: { id: string; order: number; parentId?: string }[]) =>
    fetchAPI<{ success: boolean }>("/pages/reorder", {
      method: "POST",
      body: JSON.stringify({ updates }),
    }),
};

// Blocks API
export const blocksAPI = {
  list: (pageId: string) => fetchAPI<{ blocks: any[] }>(`/blocks?pageId=${pageId}`),
  create: (data: { pageId: string; type: string; content: string; order: number; metadata?: string }) =>
    fetchAPI<{ block: any }>("/blocks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ type: string; content: string; order: number; metadata: string }>) =>
    fetchAPI<{ block: any }>(`/blocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<{ success: boolean }>(`/blocks/${id}`, {
      method: "DELETE",
    }),
  reorder: (updates: { id: string; order: number }[]) =>
    fetchAPI<{ success: boolean }>("/blocks/reorder", {
      method: "POST",
      body: JSON.stringify({ updates }),
    }),
};

// Search API
export const searchAPI = {
  search: (query: string) =>
    fetchAPI<{ results: any[] }>(`/search?q=${encodeURIComponent(query)}`),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (email: string, password: string, name: string) =>
    fetchAPI<{ user: any; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  me: () => fetchAPI<{ user: any }>("/auth/me"),
};

// Recently Viewed API
export const recentlyViewedAPI = {
  list: () => fetchAPI<{ pages: any[] }>("/recently-viewed"),
  add: (pageId: string) =>
    fetchAPI<{ success: boolean }>("/recently-viewed", {
      method: "POST",
      body: JSON.stringify({ pageId }),
    }),
};
