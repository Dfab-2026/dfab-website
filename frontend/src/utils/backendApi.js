const DEFAULT_DEPLOYED_BACKEND_URL = "https://dfab-backend.onrender.com";
const DEFAULT_LOCAL_BACKEND_PORT = "8000";

function trimTrailingSlash(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function normalizeBackendUrl(value = "") {
  return trimTrailingSlash(value).replace(/\/api$/i, "");
}

function isPrivateIpv4(hostname = "") {
  if (/^10(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  if (/^192\.168(?:\.\d{1,3}){2}$/.test(hostname)) return true;

  const match = hostname.match(/^172\.(\d{1,3})(?:\.\d{1,3}){2}$/);
  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

export function isLocalFrontend() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || isPrivateIpv4(hostname);
}

function localBackendFromBrowser() {
  if (typeof window === "undefined") return `http://127.0.0.1:${DEFAULT_LOCAL_BACKEND_PORT}`;

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${hostname}:${DEFAULT_LOCAL_BACKEND_PORT}`;
  }

  if (isPrivateIpv4(hostname)) {
    return `http://${hostname}:${DEFAULT_LOCAL_BACKEND_PORT}`;
  }

  return `http://127.0.0.1:${DEFAULT_LOCAL_BACKEND_PORT}`;
}

function configuredBackendForCurrentBrowser() {
  const configured = normalizeBackendUrl(process.env.REACT_APP_BACKEND_URL);
  if (!configured) return "";

  // A common local-development mistake is setting localhost in .env and then
  // opening the React app through a LAN address such as 192.168.1.55:3000.
  // In that case localhost points to the viewing device, not the development PC.
  // Reuse the current LAN hostname and keep the configured backend port.
  if (typeof window !== "undefined" && isPrivateIpv4(window.location.hostname)) {
    try {
      const parsed = new URL(configured);
      if (["localhost", "127.0.0.1"].includes(parsed.hostname)) {
        const port = parsed.port || DEFAULT_LOCAL_BACKEND_PORT;
        return `${parsed.protocol}//${window.location.hostname}:${port}`;
      }
    } catch (_) {
      // Invalid configuration falls through to the normal local backend.
    }
  }

  return configured;
}

export function getBackendUrl() {
  const configured = configuredBackendForCurrentBrowser();

  if (isLocalFrontend()) {
    // Respect an explicit remote backend (for example Render). Otherwise use
    // the same host as the local/LAN frontend with FastAPI on port 8000.
    return configured || localBackendFromBrowser();
  }

  return configured || DEFAULT_DEPLOYED_BACKEND_URL;
}

export function getApiBase() {
  const configured = configuredBackendForCurrentBrowser();

  if (isLocalFrontend()) {
    return `${configured || localBackendFromBrowser()}/api`;
  }

  // On Vercel, same-origin /api is rewritten to Render by vercel.json when no
  // explicit backend URL is configured. This avoids browser CORS dependency in
  // production while preserving a configured backend when supplied.
  if (configured) return `${configured}/api`;
  if (typeof window !== "undefined") return "/api";
  return `${DEFAULT_DEPLOYED_BACKEND_URL}/api`;
}

export function getDirectApiBase() {
  return `${getBackendUrl()}/api`;
}
