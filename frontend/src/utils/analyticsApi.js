import { getApiBase, getDirectApiBase } from "./backendApi";

const VISITOR_ID_KEY = "dfab_analytics_visitor_id";

export function getVisitorId() {
  if (typeof window === "undefined") return "server";

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (visitorId) return visitorId;

  visitorId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  localStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
}

function uniqueRoots() {
  const roots = [getApiBase(), getDirectApiBase()].filter(Boolean);
  return [...new Set(roots)];
}

function shouldTryNextRoot(error) {
  // Authentication/validation errors are real API responses and must never be
  // hidden by switching servers. Retry only connectivity/proxy/server-gateway
  // failures where the same request can safely reach the same Render backend.
  if (!error?.status) return true;
  return [404, 408, 502, 503, 504].includes(error.status);
}

async function fetchAnalyticsRoot(root, endpoint, fetchOptions, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${root}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (response.status === 401) {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? await response.json() : null;
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(
        `Analytics request timed out after ${Math.round(timeoutMs / 1000)} seconds`
      );
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function analyticsRequest(endpoint, options = {}) {
  const { timeoutMs = 60000, ...fetchOptions } = options;
  const roots = uniqueRoots();
  let lastError = null;

  for (let index = 0; index < roots.length; index += 1) {
    const root = roots[index];
    try {
      return await fetchAnalyticsRoot(root, endpoint, fetchOptions, timeoutMs);
    } catch (error) {
      lastError = error;
      const hasAnotherRoot = index < roots.length - 1;
      if (!hasAnotherRoot || !shouldTryNextRoot(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Analytics API is unavailable");
}

export function recordPageView(payload) {
  return analyticsRequest("/analytics/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function recordBrochureDownload(payload) {
  return analyticsRequest("/analytics/brochure-download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
