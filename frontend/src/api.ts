import { Category, Product, ProductInput, StoreSummary } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type RequestOptions = RequestInit & {
  ignoreBody?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Keep HTTP status text if API did not return JSON.
    }
    throw new Error(message);
  }

  if (options.ignoreBody || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/api/categories");
}

export async function createCategory(name: string): Promise<Category> {
  return request<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name })
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return request<void>(`/api/categories/${id}`, {
    method: "DELETE",
    ignoreBody: true
  });
}

export async function getProducts(includeDisabled = true): Promise<Product[]> {
  const query = includeDisabled ? "?includeDisabled=true" : "";
  return request<Product[]>(`/api/products${query}`);
}

export async function getSummary(): Promise<StoreSummary> {
  return request<StoreSummary>("/api/summary");
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  return request<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateProduct(id: string, payload: ProductInput): Promise<Product> {
  return request<Product>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function toggleProductStatus(id: string, enabled: boolean): Promise<Product> {
  return request<Product>(`/api/products/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ enabled })
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return request<void>(`/api/products/${id}`, {
    method: "DELETE",
    ignoreBody: true
  });
}
