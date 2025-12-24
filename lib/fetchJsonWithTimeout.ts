export type FetchErrorCategory = "timeout" | "network" | "http" | "unknown";

export class ApiError extends Error {
  status?: number;
  category: FetchErrorCategory;
  details?: string;

  constructor(message: string, category: FetchErrorCategory, status?: number, details?: string) {
    super(message);
    this.category = category;
    this.status = status;
    this.details = details;
  }
}

interface FetchJsonOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

const isTransientStatus = (status: number) => [408, 425, 429, 500, 502, 503, 504].includes(status);

export async function fetchJsonWithTimeout<T>(
  url: string,
  { timeoutMs = 30000, retries = 0, ...options }: FetchJsonOptions = {},
): Promise<{ data: T; status: number }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const retryCount = retries ?? 0;
      if (retryCount > 0 && isTransientStatus(response.status)) {
        return fetchJsonWithTimeout<T>(url, {
          timeoutMs,
          retries: retryCount - 1,
          ...options,
        });
      }

      const message =
        typeof payload === "object" && payload && "error" in payload
          ? String((payload as { error: unknown }).error)
          : typeof payload === "string"
            ? payload
            : "Request failed";

      throw new ApiError(message || `Request failed with status ${response.status}`, "http", response.status);
    }

    return { data: payload as T, status: response.status };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if ((error as Error).name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", "timeout");
    }

    if (error instanceof TypeError) {
      // network error
      throw new ApiError("Network error. Check your connection and try again.", "network");
    }

    throw new ApiError((error as Error).message || "Unknown error", "unknown");
  } finally {
    clearTimeout(id);
  }
}
