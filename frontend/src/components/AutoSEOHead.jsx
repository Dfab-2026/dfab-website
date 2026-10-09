import { useEffect, useState } from "react";
import axios from "axios";
import SEOHead from "./SEOHead";
import { getApiBase, isLocalFrontend } from "../utils/backendApi";

const AI_SEO_ENABLED = process.env.REACT_APP_AI_SEO_ENABLED !== "false";
const AI_SEO_ALLOW_LOCAL = process.env.REACT_APP_AI_SEO_ALLOW_LOCAL === "true";
const CACHE_PREFIX = "dfab_ai_seo_v2:";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const API = getApiBase();

function safeReadCache(cacheKey) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
      return null;
    }
    return parsed.data || null;
  } catch {
    return null;
  }
}

function safeWriteCache(cacheKey, data) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${cacheKey}`,
      JSON.stringify({ savedAt: Date.now(), data })
    );
  } catch {
    // SEO must never interfere with the page if storage is unavailable.
  }
}

function normalizeKeywords(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, 12);
}

export default function AutoSEOHead({
  cacheKey,
  contentSummary,
  noAi = false,
  ...base
}) {
  const [optimized, setOptimized] = useState(null);
  const keywordSignature = JSON.stringify(base.keywords || []);

  useEffect(() => {
    let cancelled = false;
    setOptimized(null);

    // Keep deterministic metadata active everywhere. On localhost, AI SEO is
    // opt-in so normal development does not consume Gemini tokens.
    if (!AI_SEO_ENABLED || !API || noAi || (isLocalFrontend() && !AI_SEO_ALLOW_LOCAL)) {
      return () => {
        cancelled = true;
      };
    }

    const key = cacheKey || base.canonicalPath || window.location.pathname;
    const cached = safeReadCache(key);
    if (cached) {
      setOptimized(cached);
      return () => {
        cancelled = true;
      };
    }

    axios
      .post(
        `${API}/seo/optimize`,
        {
          path: base.canonicalPath || window.location.pathname,
          title: base.title,
          description: base.description,
          keywords: base.keywords || [],
          content_summary: String(contentSummary || base.description).slice(0, 700),
        },
        { timeout: 6000 }
      )
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.optimized === false) return;

        const safeData = {
          title:
            typeof data.title === "string" && data.title.length >= 20 && data.title.length <= 70
              ? data.title.trim()
              : base.title,
          description:
            typeof data.description === "string" &&
            data.description.length >= 80 &&
            data.description.length <= 180
              ? data.description.trim()
              : base.description,
          keywords: normalizeKeywords(data.keywords, base.keywords),
        };
        safeWriteCache(key, safeData);
        setOptimized(safeData);
      })
      .catch(() => {
        // The deterministic metadata remains active if AI is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [
    cacheKey,
    contentSummary,
    noAi,
    base.canonicalPath,
    base.title,
    base.description,
    keywordSignature,
  ]);

  return <SEOHead {...base} {...(optimized || {})} />;
}
