import { getApiBase, getBackendUrl } from "./backendApi";

export function getProjectsBackendUrl() {
  return getBackendUrl();
}

export function getProjectsApiBase() {
  return getApiBase();
}

function normalizePublished(project = {}) {
  const keys = ["published", "isPublished", "is_published", "active", "is_active"];
  let raw;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(project, key)) {
      raw = project[key];
      break;
    }
  }

  if (raw == null && Object.prototype.hasOwnProperty.call(project, "status")) {
    raw = project.status;
  }

  if (raw == null) return true;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw !== 0;

  const value = String(raw).trim().toLowerCase();
  if (
    ["false", "0", "no", "off", "draft", "unpublished", "hidden", "inactive", "archived"].includes(
      value
    )
  ) {
    return false;
  }
  if (["true", "1", "yes", "on", "published", "live", "active", "public"].includes(value)) {
    return true;
  }

  return true;
}

export function normalizeProject(project = {}, index = 0) {
  const title = project.title || project.name || "DFAB Project";

  return {
    ...project,
    id:
      project.id ||
      project.project_id ||
      project.slug ||
      project._id ||
      `${title}-${index}`,
    title,
    desc: project.desc || project.description || project.content || "",
    img: project.img || project.image_url || project.image || project.thumbnail || "",
    tag: project.tag || project.category || project.type || "Project",
    featured: Boolean(project.featured),
    published: normalizePublished(project),
  };
}

export function normalizeProjects(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.projects)
    ? payload.projects
    : [];

  return list.map(normalizeProject);
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error("Request aborted");
      error.name = "AbortError";
      reject(error);
      return;
    }

    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      const error = new Error("Request aborted");
      error.name = "AbortError";
      reject(error);
    };

    if (signal) signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function fetchJson(url, { signal, timeoutMs = 75000, headers = {} } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const abortFromParent = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abortFromParent, { once: true });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        ...headers,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Projects request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener("abort", abortFromParent);
  }
}

/**
 * Public Projects data source.
 * MongoDB-backed /api/projects is the only source. No localStorage, seed data,
 * hardcoded cards or automatic database cleanup is used here.
 */
export async function fetchPublishedProjects({ signal, timeoutMs = 75000 } = {}) {
  const url = `${getProjectsApiBase()}/projects?_ts=${Date.now()}`;
  let lastError = null;

  // Two same-origin attempts protect against a sleeping Render instance while
  // avoiding the direct-Render/CORS split that previously made the cards vanish.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const payload = await fetchJson(url, { signal, timeoutMs });
      return normalizeProjects(payload).filter((project) => project.published !== false);
    } catch (error) {
      if (error?.name === "AbortError" || signal?.aborted) throw error;
      lastError = error;
      if (attempt === 0) await sleep(1500, signal);
    }
  }

  throw lastError || new Error("Projects API is unavailable");
}
