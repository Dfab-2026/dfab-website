import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getVisitorId, recordPageView } from "../utils/analyticsApi";

const ADMIN_PATHS = ["/admin", "/blog/admin", "/careers/admin"];
let lastTrackedPath = "";
let lastTrackedAt = 0;

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || "/";
    if (ADMIN_PATHS.some((prefix) => pathname.startsWith(prefix))) return;

    // React StrictMode intentionally re-runs effects in development. Ignore the
    // immediate duplicate so local analytics is not double-counted.
    const now = Date.now();
    if (lastTrackedPath === pathname && now - lastTrackedAt < 1500) return;
    lastTrackedPath = pathname;
    lastTrackedAt = now;

    recordPageView({
      path: pathname,
      visitor_id: getVisitorId(),
      referrer: document.referrer || "",
      title: document.title || "DFAB",
    }).catch(() => {
      // Analytics must never interrupt or alter the visitor experience.
    });
  }, [location.pathname]);

  return null;
}
