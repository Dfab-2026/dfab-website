import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import AutoSEOHead from "./AutoSEOHead";
import { DEFAULT_OG_IMAGE, SITE_URL, getSeoForPath } from "../seoConfig";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DFAB Stainless System Pvt Ltd",
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "No: 3B/415, No-8 KIADB Main Road, Peenya Industrial Area",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560058",
    addressCountry: "IN",
  },
};

function createSchema(pathname, config) {
  if (!config.schemaType) return null;

  const pageUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": config.schemaType,
    name: config.title,
    description: config.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "DFAB Stainless System Pvt Ltd",
      url: SITE_URL,
    },
    about: {
      "@type": "Organization",
      name: "DFAB Stainless System Pvt Ltd",
    },
  };

  return pathname === "/"
    ? {
        "@context": "https://schema.org",
        "@graph": [
          ORGANIZATION_SCHEMA,
          {
            "@type": "WebSite",
            name: "DFAB Stainless System Pvt Ltd",
            url: SITE_URL,
          },
          pageSchema,
        ],
      }
    : pageSchema;
}

export default function RouteSEO() {
  const { pathname } = useLocation();
  const config = useMemo(() => getSeoForPath(pathname), [pathname]);

  return (
    <AutoSEOHead
      cacheKey={pathname}
      title={config.title}
      description={config.description}
      keywords={config.keywords}
      robots={config.robots}
      canonicalPath={pathname}
      image={config.image || DEFAULT_OG_IMAGE}
      schema={createSchema(pathname, config)}
      contentSummary={config.contentSummary}
      noAi={config.noAi || pathname.toLowerCase().startsWith("/blog/")}
    />
  );
}
