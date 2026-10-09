import { getApiBase } from "./backendApi";

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

export async function analyticsRequest(endpoint, options = {}) {
  const root = getApiBase();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${root}${endpoint}`, {
      ...options,
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
      const timeoutError = new Error("Analytics request timed out");
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
