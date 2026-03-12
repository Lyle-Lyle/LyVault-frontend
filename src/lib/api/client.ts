import type { ApiResponse } from "@/lib/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_MALL_API_URL ?? "http://127.0.0.1:8070";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return (await response.json()) as ApiResponse<T>;
}
