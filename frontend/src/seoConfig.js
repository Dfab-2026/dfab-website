export const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://dfab.in").replace(/\/$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export const DEFAULT_SEO = {
  title: "DFAB Stainless System Pvt Ltd | Precision Fabrication Bengaluru",
  description:
    "DFAB Stainless System Pvt Ltd is an ISO 9001:2015 certified precision fabrication and manufacturing company in Bengaluru serving industrial projects with welding, machining and engineered fabrication solutions.",
  keywords: [
    "DFAB",
    "precision fabrication Bengaluru",
    "stainless steel fabrication Bengaluru",
    "industrial welding Bengaluru",
    "precision machining Bengaluru",
    "Peenya fabrication company",
  ],
  image: DEFAULT_OG_IMAGE,
  robots: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
};

export const PUBLIC_ROUTE_SEO = {
  "/": {
    title: "DFAB | Precision Fabrication, Welding & Machining Bengaluru",
    description:
      "DFAB provides precision fabrication, welding, machining, sheet metal, pipeline and engineered manufacturing solutions from Peenya Industrial Area, Bengaluru.",
    keywords: [
      "DFAB Bengaluru",
      "precision fabrication Bengaluru",
      "stainless steel fabrication",
      "industrial welding",
      "CNC machining Bengaluru",
      "sheet metal fabrication Bengaluru",
      "Peenya fabrication company",
    ],
    contentSummary:
      "DFAB company overview covering precision fabrication, welding, machining, manufacturing capabilities, industries served, projects, quality and inquiry options.",
    schemaType: "WebPage",
  },
  "/about": {
    title: "About DFAB | Precision Manufacturing Company in Bengaluru",
    description:
      "Learn about DFAB Stainless System Pvt Ltd, its leadership, engineering experience, manufacturing facility, quality culture and industrial fabrication capabilities in Bengaluru.",
    keywords: [
      "about DFAB",
      "DFAB Stainless System",
      "fabrication company Bengaluru",
      "Peenya manufacturing company",
      "industrial engineering Bengaluru",
    ],
    contentSummary:
      "About DFAB, leadership, company vision, mission, quality policy, manufacturing experience, facility and engineering strengths.",
    schemaType: "AboutPage",
  },
  "/services": {
    title: "Fabrication & Manufacturing Services | DFAB Bengaluru",
    description:
      "Explore DFAB services including sheet metal fabrication, pipeline assemblies, welding engineering, precision machining, jigs, fixtures, D2M and prototype development.",
    keywords: [
      "fabrication services Bengaluru",
      "sheet metal fabrication",
      "pipeline fabrication",
      "precision machining",
      "welding engineering services",
      "jig fixture development",
      "prototype development Bengaluru",
    ],
    contentSummary:
      "DFAB industrial services: sheet metal fabrication, CDU manifold and piping assemblies, pipeline fabrication, stellite and die welding, custom fabrication, jigs and fixtures, precision machining, NPD, WPS/PQR, D2M and prototypes.",
    schemaType: "CollectionPage",
  },
  "/capabilities": {
    title: "Manufacturing Capabilities | Laser, CNC, Welding & Fabrication | DFAB",
    description:
      "See DFAB manufacturing capabilities in laser cutting, CNC bending, welding, CNC machining, heavy fabrication, high-precision assembly and testing in Bengaluru.",
    keywords: [
      "DFAB capabilities",
      "laser cutting Bengaluru",
      "CNC bending Bengaluru",
      "CNC machining",
      "6G welding",
      "heavy fabrication",
      "precision assembly testing",
    ],
    contentSummary:
      "DFAB production and engineering capabilities including laser cutting, CNC bending, welding, CNC machining, heavy fabrication, assembly and functional testing.",
    schemaType: "CollectionPage",
  },
  "/quality": {
    title: "Quality & Certifications | ISO 9001:2015 | DFAB Bengaluru",
    description:
      "Review DFAB quality systems, ISO 9001:2015 certification, welding qualifications, inspection controls and manufacturing quality practices for industrial projects.",
    keywords: [
      "DFAB ISO 9001 2015",
      "fabrication quality Bengaluru",
      "welding quality assurance",
      "WPS PQR",
      "industrial inspection",
      "manufacturing certification",
    ],
    contentSummary:
      "DFAB quality management, certifications, welding qualifications, incoming inspection, in-process QC, welding QA and final inspection documentation.",
    schemaType: "WebPage",
  },
  "/infrastructure": {
    title: "Manufacturing Infrastructure & Equipment | DFAB Bengaluru",
    description:
      "Explore DFAB's manufacturing infrastructure in Bengaluru including welding systems, machining equipment, laser technology, EOT crane and skilled production teams.",
    keywords: [
      "DFAB infrastructure",
      "fabrication facility Bengaluru",
      "welding machines Bengaluru",
      "laser cutting facility",
      "CNC machining facility",
      "Peenya industrial facility",
    ],
    contentSummary:
      "DFAB manufacturing facility, machines, welding equipment, machining resources, lifting capability, workshop capabilities and skilled technical workforce.",
    schemaType: "WebPage",
  },
  "/projects": {
    title: "Industrial Fabrication Projects & Case Work | DFAB",
    description:
      "View DFAB industrial fabrication and manufacturing projects across welding, pipelines, precision assemblies, machining and custom engineered applications.",
    keywords: [
      "DFAB projects",
      "industrial fabrication projects",
      "welding projects Bengaluru",
      "pipeline fabrication projects",
      "precision manufacturing projects",
    ],
    contentSummary:
      "DFAB project portfolio showing industrial fabrication, welding, machining, pipeline, assembly and engineered manufacturing work.",
    schemaType: "CollectionPage",
  },
  "/blog": {
    title: "Technical Manufacturing Blog | Welding & Fabrication | DFAB",
    description:
      "Read DFAB technical articles on welding, fabrication, machining, quality standards, manufacturing processes and industrial engineering practices.",
    keywords: [
      "DFAB blog",
      "welding articles",
      "fabrication technical blog",
      "manufacturing engineering blog",
      "industrial quality articles",
    ],
    contentSummary:
      "DFAB technical blog about welding, fabrication, machining, manufacturing quality, standards and industrial engineering topics.",
    schemaType: "Blog",
  },
  "/careers": {
    title: "Careers at DFAB | Manufacturing Jobs in Bengaluru",
    description:
      "Explore career opportunities at DFAB in welding, fabrication, CNC machining, quality and industrial manufacturing at Peenya, Bengaluru.",
    keywords: [
      "DFAB careers",
      "fabrication jobs Bengaluru",
      "welder jobs Bengaluru",
      "CNC jobs Peenya",
      "manufacturing jobs Bengaluru",
      "quality inspector jobs Bengaluru",
    ],
    contentSummary:
      "DFAB career opportunities for manufacturing, welding, fabrication, CNC and quality roles in Bengaluru.",
    schemaType: "CollectionPage",
  },
  "/contact": {
    title: "Contact DFAB | Industrial Fabrication Enquiries Bengaluru",
    description:
      "Contact DFAB Stainless System Pvt Ltd in Peenya, Bengaluru for fabrication, welding, machining, pipeline, prototype and industrial manufacturing enquiries.",
    keywords: [
      "contact DFAB",
      "fabrication enquiry Bengaluru",
      "DFAB Peenya",
      "industrial welding enquiry",
      "manufacturing quotation Bengaluru",
    ],
    contentSummary:
      "DFAB contact and inquiry page for industrial fabrication, welding, machining and engineered manufacturing requirements in Bengaluru.",
    schemaType: "ContactPage",
  },
};

export const ADMIN_PATH_PREFIXES = ["/admin", "/blog/admin", "/careers/admin"];

export function getSeoForPath(pathname) {
  const rawPath = String(pathname || "/").toLowerCase();
  const normalizedPath = rawPath === "/" ? "/" : rawPath.replace(/\/+$/, "") || "/";

  if (ADMIN_PATH_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
    return {
      ...DEFAULT_SEO,
      title: "DFAB Administration",
      description: "DFAB internal administration area.",
      keywords: [],
      robots: "noindex,nofollow,noarchive,nosnippet",
      noAi: true,
      schemaType: null,
    };
  }

  if (normalizedPath.startsWith("/blog/") && normalizedPath !== "/blog/admin") {
    return {
      ...DEFAULT_SEO,
      ...PUBLIC_ROUTE_SEO["/blog"],
      title: "Technical Article | DFAB",
      description:
        "Read a DFAB technical article covering industrial welding, fabrication, machining, manufacturing quality or engineering practices.",
      contentSummary: "DFAB technical blog article.",
      schemaType: "Article",
    };
  }

  return {
    ...DEFAULT_SEO,
    ...(PUBLIC_ROUTE_SEO[normalizedPath] || {
      title: "Page Not Found | DFAB",
      description: "The requested DFAB page could not be found.",
      keywords: [],
      robots: "noindex,follow",
      noAi: true,
      schemaType: null,
    }),
  };
}
