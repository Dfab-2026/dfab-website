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

  // Old DFAB project records pre-date the published flag. Those records were
  // created as public portfolio entries, so missing publication state means live.
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

async function fetchJson(url, { signal, timeoutMs = 30000, headers = {} } = {}) {
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
      throw new Error(`Projects request failed with status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener("abort", abortFromParent);
  }
}

/**
 * Public Projects page data source.
 * MongoDB-backed /api/projects is the only source. No localStorage, hardcoded
 * cards, seed data, or frontend fallback projects are used here.
 */
export async function fetchPublishedProjects({ signal, timeoutMs = 30000 } = {}) {
  const payload = await fetchJson(`${getProjectsApiBase()}/projects?_ts=${Date.now()}`, {
    signal,
    timeoutMs,
  });

  return normalizeProjects(payload).filter((project) => project.published !== false);
}
