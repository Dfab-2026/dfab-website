import { useEffect } from "react";
import { DEFAULT_OG_IMAGE, SITE_URL } from "../seoConfig";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, String(value));
    }
  });
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  const selector = `script[data-seo-schema="${id}"]`;
  let element = document.head.querySelector(selector);

  if (!data) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.seoSchema = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

export function applySeoMetadata({
  title,
  description,
  keywords = [],
  canonicalPath,
  canonicalUrl,
  image = DEFAULT_OG_IMAGE,
  imageAlt = "DFAB Stainless System Pvt Ltd",
  robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  schema,
}) {
  const resolvedCanonical =
    canonicalUrl || `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath || window.location.pathname}`;

  document.title = title;

  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="keywords"]', {
    name: "keywords",
    content: Array.isArray(keywords) ? keywords.join(", ") : keywords,
  });
  upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
  upsertMeta('meta[name="googlebot"]', { name: "googlebot", content: robots });
  upsertMeta('meta[name="bingbot"]', { name: "bingbot", content: robots });
  upsertMeta('meta[name="author"]', { name: "author", content: author || "DFAB Stainless System Pvt Ltd" });
  upsertMeta('meta[name="geo.region"]', { name: "geo.region", content: "IN-KA" });
  upsertMeta('meta[name="geo.placename"]', { name: "geo.placename", content: "Bengaluru" });

  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: resolvedCanonical });
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "DFAB Stainless System Pvt Ltd" });
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_IN" });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
  upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: imageAlt });

  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: imageAlt });

  if (publishedTime) {
    upsertMeta('meta[property="article:published_time"]', {
      property: "article:published_time",
      content: publishedTime,
    });
  } else {
    document.head.querySelector('meta[property="article:published_time"]')?.remove();
  }

  if (modifiedTime) {
    upsertMeta('meta[property="article:modified_time"]', {
      property: "article:modified_time",
      content: modifiedTime,
    });
  } else {
    document.head.querySelector('meta[property="article:modified_time"]')?.remove();
  }

  upsertLink("canonical", resolvedCanonical);
  upsertJsonLd("page", schema);
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonicalPath,
  canonicalUrl,
  image = DEFAULT_OG_IMAGE,
  imageAlt = "DFAB Stainless System Pvt Ltd",
  robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  schema,
}) {
  const serializedKeywords = Array.isArray(keywords) ? keywords.join("|") : keywords || "";
  const serializedSchema = schema ? JSON.stringify(schema) : "";

  useEffect(() => {
    applySeoMetadata({
      title,
      description,
      keywords,
      canonicalPath,
      canonicalUrl,
      image,
      imageAlt,
      robots,
      type,
      publishedTime,
      modifiedTime,
      author,
      schema,
    });
  }, [
    title,
    description,
    keywords,
    serializedKeywords,
    canonicalPath,
    canonicalUrl,
    image,
    imageAlt,
    robots,
    type,
    publishedTime,
    modifiedTime,
    author,
    schema,
    serializedSchema,
  ]);

  return null;
}
