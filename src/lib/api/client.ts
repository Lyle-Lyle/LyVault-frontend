import type { ApiResponse } from "@/lib/api/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_MALL_API_URL ?? "";

function getRequestLocale() {
  if (typeof window === "undefined") {
    return "zh";
  }

  return window.location.pathname.startsWith("/en") ? "en" : "zh";
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": getRequestLocale(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return (await response.json()) as ApiResponse<T>;
}
