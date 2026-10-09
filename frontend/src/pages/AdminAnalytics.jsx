import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Download,
  Eye,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";
import { analyticsRequest } from "../utils/analyticsApi";

const ADMIN_SESSION_KEY = "dfab_admin_logged_in";
const ADMIN_TOKEN_KEY = "dfab_admin_token";
const ANALYTICS_CACHE_PREFIX = "dfab_analytics_summary_v3:";
const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

const EMPTY_SUMMARY = {
  period: "all",
  period_label: "All time",
  total_views: 0,
  unique_visitors: 0,
  views_today: 0,
  brochure_downloads: 0,
  brochure_downloads_today: 0,
  popular_pages: [],
  daily_views: [],
  trend_views: [],
  trend_title: "All Time Traffic",
  recent_brochure_downloads: [],
  recent_views: [],
};

const now = new Date();
const currentYear = now.getFullYear();
const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const YEAR_OPTIONS = Array.from(
  { length: Math.max(1, currentYear - 2018 + 1) },
  (_, index) => currentYear - index
);

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function niceAxisMax(value) {
  const safe = Math.max(1, Number(value) || 0);
  if (safe <= 5) return 5;
  if (safe <= 10) return 10;

  const magnitude = 10 ** Math.floor(Math.log10(safe));
  const normalized = safe / magnitude;
  const rounded = normalized <= 1
    ? 1
    : normalized <= 2
    ? 2
    : normalized <= 5
    ? 5
    : 10;

  return rounded * magnitude;
}

function pageLabel(path) {
  if (!path || path === "/") return "Home";
  return path
    .split("?")[0]
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[-_]/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

export default function AdminAnalytics() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [filterDate, setFilterDate] = useState(currentDate);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [appliedFilter, setAppliedFilter] = useState({ mode: "all", value: "" });

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setSummary(EMPTY_SUMMARY);
    setLastUpdated(null);
  }, []);

  const fetchSummary = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const params = new URLSearchParams({ period: appliedFilter.mode });
    if (appliedFilter.mode === "date" && appliedFilter.value) params.set("date", appliedFilter.value);
    if (appliedFilter.mode === "month" && appliedFilter.value) params.set("month", appliedFilter.value);
    if (appliedFilter.mode === "year" && appliedFilter.value) params.set("year", appliedFilter.value);

    const cacheKey = `${ANALYTICS_CACHE_PREFIX}${params.toString()}`;
    let hasCachedSummary = false;

    // Instant paint on repeat visits/filter selections while a fresh MongoDB
    // summary is refreshed in the background.
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
      if (cached && cached.data) {
        hasCachedSummary = true;
        setSummary({ ...EMPTY_SUMMARY, ...cached.data });
        setLastUpdated(cached.savedAt ? new Date(cached.savedAt) : new Date());
      }
    } catch (_) {
      sessionStorage.removeItem(cacheKey);
    }

    try {
      if (!hasCachedSummary) setLoading(true);
      setError("");
      const data = await analyticsRequest(`/admin/analytics/summary?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const nextSummary = { ...EMPTY_SUMMARY, ...(data || {}) };
      setSummary(nextSummary);
      const updatedAt = new Date();
      setLastUpdated(updatedAt);
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ data: nextSummary, savedAt: updatedAt.toISOString() })
      );
    } catch (requestError) {
      if (requestError?.status === 401) {
        handleUnauthorized();
      } else if (!hasCachedSummary) {
        setError("Could not load analytics. Please confirm the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, [appliedFilter, handleUnauthorized]);

  useEffect(() => {
    const loggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === "true";
    const token = getToken();

    if (loggedIn && token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchSummary();
  }, [isLoggedIn, fetchSummary]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const data = await analyticsRequest("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setPassword("");
      setIsLoggedIn(true);
    } catch {
      setError("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsLoggedIn(false);
    setSummary(EMPTY_SUMMARY);
    setLastUpdated(null);
  };

  const applyFilter = () => {
    const value =
      filterMode === "date"
        ? filterDate
        : filterMode === "month"
        ? filterMonth
        : filterMode === "year"
        ? filterYear
        : "";

    setAppliedFilter({ mode: filterMode, value });
  };

  const resetFilter = () => {
    setFilterMode("all");
    setFilterDate(currentDate);
    setFilterMonth(currentMonth);
    setFilterYear(String(currentYear));
    setAppliedFilter({ mode: "all", value: "" });
  };

  const trendViews = useMemo(
    () => (summary.trend_views?.length ? summary.trend_views : summary.daily_views || []),
    [summary.trend_views, summary.daily_views]
  );

  const maxDailyViews = useMemo(
    () => Math.max(1, ...trendViews.map((item) => item.views || 0)),
    [trendViews]
  );

  const trafficAxisMax = useMemo(() => niceAxisMax(maxDailyViews), [maxDailyViews]);

  const trafficAxisTicks = useMemo(
    () => [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(trafficAxisMax * ratio)),
    [trafficAxisMax]
  );

  const trafficLabelStep = useMemo(
    () => Math.max(1, Math.ceil(trendViews.length / 8)),
    [trendViews.length]
  );

  const trafficXAxisTitle = useMemo(() => {
    if (appliedFilter.mode === "date") return "Hour of day";
    if (appliedFilter.mode === "month") return "Day of month";
    if (appliedFilter.mode === "year") return "Month";
    return "Month / period";
  }, [appliedFilter.mode]);

  const maxPageViews = useMemo(
    () => Math.max(1, ...(summary.popular_pages || []).map((item) => item.views || 0)),
    [summary.popular_pages]
  );

  const downloadConversion = useMemo(() => {
    if (!summary.total_views) return 0;
    return (summary.brochure_downloads / summary.total_views) * 100;
  }, [summary.brochure_downloads, summary.total_views]);

  const avgViewsPerVisitor = useMemo(() => {
    if (!summary.unique_visitors) return 0;
    return summary.total_views / summary.unique_visitors;
  }, [summary.total_views, summary.unique_visitors]);

  if (!isLoggedIn) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#07101f] flex items-center justify-center px-4 py-16">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
          aria-hidden="true"
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden="true" />

        <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl shadow-black/30">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#111c31] to-[#0A66C2] p-8 text-white">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <BarChart3 size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/80">DFAB Admin</p>
            <h1 className="text-3xl font-bold font-['Chivo'] mt-2">Site Analytics</h1>
            <p className="text-sm text-blue-100/70 mt-2 leading-relaxed">
              Website traffic, page performance and brochure lead activity in one place.
            </p>
          </div>

          <div className="p-8 bg-white">
            <p className="text-sm text-slate-500 mb-6">
              Use the same admin password as the Projects dashboard.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block">
                <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Admin password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none transition-all focus:border-[#0A66C2] focus:ring-4 focus:ring-blue-100"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-[#0A66C2] text-white py-3.5 rounded-xl font-bold hover:bg-[#084e96] hover:shadow-lg hover:shadow-blue-200/60 transition-all disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login to Analytics"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0A66C2] transition-colors"
              >
                <ArrowLeft size={16} /> Back to About
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const statCards = [
    {
      label: "Page Views",
      value: summary.total_views,
      note: summary.period_label || "All time",
      icon: Eye,
      accent: "from-blue-500 to-cyan-400",
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Unique Visitors",
      value: summary.unique_visitors,
      note: `${avgViewsPerVisitor.toFixed(1)} avg. views / visitor`,
      icon: Users,
      accent: "from-violet-500 to-fuchsia-400",
      iconClass: "bg-violet-50 text-violet-600",
    },
    {
      label: "Brochure Downloads",
      value: summary.brochure_downloads,
      note: summary.period_label || "All time",
      icon: Download,
      accent: "from-emerald-500 to-teal-400",
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Brochure Conversion",
      displayValue: `${downloadConversion.toFixed(1)}%`,
      note: `${formatNumber(summary.brochure_downloads)} downloads / ${formatNumber(summary.total_views)} views`,
      icon: Activity,
      accent: "from-amber-500 to-orange-400",
      iconClass: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-20">
      <section className="relative overflow-hidden bg-[#07101f] px-4 pt-10 pb-28">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
          aria-hidden="true"
        />
        <div className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full bg-blue-600/15 blur-3xl" aria-hidden="true" />

        <div className="relative max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Live website data</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-['Chivo'] tracking-tight">
              Site Analytics Dashboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mt-3 leading-relaxed">
              Monitor DFAB website visibility, visitor activity and brochure lead generation without changing the public site flow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
              <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500">Last refreshed</p>
              <p className="text-xs font-semibold text-slate-200 mt-1">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "Waiting for data"}
              </p>
            </div>
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="bg-white text-slate-900 hover:bg-blue-50 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-black/10"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={17} /> Logout
            </button>
          </div>
        </div>
      </section>

      <section className="relative max-w-[1400px] mx-auto px-4 md:px-8 -mt-16 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium shadow-sm">
            {error}
          </div>
        )}

        <article className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A66C2]">Analytics filter</p>
              <h2 className="text-xl md:text-2xl font-bold text-slate-950 font-['Chivo'] mt-1">View traffic by date, month or year</h2>
              <p className="text-sm text-slate-500 mt-1">All cards, charts, page rankings and lead tables use the same selected period.</p>
            </div>

            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 self-start xl:self-auto">
              {[
                ["all", "All Time"],
                ["date", "Date"],
                ["month", "Month"],
                ["year", "Year"],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterMode === mode
                      ? "bg-white text-[#0A66C2] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
            <div>
              {filterMode === "date" && (
                <label className="block">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-2">Select date</span>
                  <input
                    type="date"
                    value={filterDate}
                    max={currentDate}
                    onChange={(event) => setFilterDate(event.target.value)}
                    className="w-full md:max-w-xs border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0A66C2] focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              )}

              {filterMode === "month" && (
                <label className="block">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-2">Select month</span>
                  <input
                    type="month"
                    value={filterMonth}
                    max={currentMonth}
                    onChange={(event) => setFilterMonth(event.target.value)}
                    className="w-full md:max-w-xs border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0A66C2] focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              )}

              {filterMode === "year" && (
                <label className="block">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-2">Select year</span>
                  <select
                    value={filterYear}
                    onChange={(event) => setFilterYear(event.target.value)}
                    className="w-full md:max-w-xs border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white focus:border-[#0A66C2] focus:ring-4 focus:ring-blue-100"
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>
              )}

              {filterMode === "all" && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500 md:max-w-md">
                  Showing all analytics recorded since tracking was enabled.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetFilter}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilter}
                disabled={loading}
                className="px-5 py-3 rounded-xl bg-[#0A66C2] text-white text-sm font-bold hover:bg-[#084e96] transition-colors disabled:opacity-60"
              >
                {loading ? "Loading..." : "Apply Filter"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Currently showing:</span>
            <span className="rounded-full bg-blue-50 text-[#0A66C2] border border-blue-100 px-3 py-1 font-bold">
              {summary.period_label || "All time"}
            </span>
          </div>
        </article>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map(({ label, value, displayValue, note, icon: Icon, accent, iconClass }) => (
            <article
              key={label}
              className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
              <div className="flex items-start justify-between gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}>
                  <Icon size={21} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Live</p>
                </div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 mt-6">{label}</p>
              <p className="text-4xl font-black text-slate-950 mt-2 tabular-nums">{displayValue ?? formatNumber(value)}</p>
              <p className="text-sm text-slate-500 mt-2">{note}</p>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-8">
          <article className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="p-6 md:p-7 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A66C2]">Traffic distribution</p>
                <h2 className="text-xl md:text-2xl font-bold text-slate-950 font-['Chivo'] mt-1">Popular Pages</h2>
                <p className="text-sm text-slate-500 mt-1">Top destinations based on recorded page views.</p>
              </div>
              <BarChart3 size={22} className="text-slate-300 shrink-0" />
            </div>

            <div className="p-6 md:p-7 space-y-5">
              {(summary.popular_pages || []).length === 0 ? (
                <div className="min-h-[270px] flex items-center justify-center text-sm text-slate-400">
                  No site-view data yet.
                </div>
              ) : (
                summary.popular_pages.map((item, index) => {
                  const width = Math.max(5, (item.views / maxPageViews) * 100);
                  return (
                    <div key={item.path} className="group">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate">{pageLabel(item.path)}</p>
                          <p className="text-[11px] text-slate-400 truncate">{item.path}</p>
                        </div>
                        <span className="text-sm font-black text-slate-950 tabular-nums">{formatNumber(item.views)}</span>
                      </div>
                      <div className="ml-11 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#0A66C2] to-cyan-400 transition-[width] duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>

          <article className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="p-6 md:p-7 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A66C2]">Traffic trend</p>
                <h2 className="text-xl md:text-2xl font-bold text-slate-950 font-['Chivo'] mt-1">{summary.trend_title || "Traffic Trend"}</h2>
                <p className="text-sm text-slate-500 mt-1">Traffic for {summary.period_label || "the selected period"}.</p>
              </div>
              <Activity size={22} className="text-slate-300 shrink-0" />
            </div>

            <div className="p-6 md:p-7">
              <div className="h-[360px] rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 p-4 md:p-5">
                {trendViews.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    No traffic data yet.
                  </div>
                ) : (
                  <div className="h-full flex gap-3">
                    <div className="relative w-12 shrink-0 pt-1 pb-12" aria-hidden="true">
                      <span
                        className="absolute -left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500"
                      >
                        Views
                      </span>
                      <div className="relative ml-5 h-full">
                        {trafficAxisTicks.map((tick, index) => (
                          <span
                            key={`${tick}-${index}`}
                            className="absolute right-0 -translate-y-1/2 text-[10px] md:text-[11px] font-bold text-slate-600 tabular-nums"
                            style={{ top: `${(index / (trafficAxisTicks.length - 1)) * 100}%` }}
                          >
                            {formatNumber(tick)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col">
                      <div className="relative flex-1 min-h-0 border-l-2 border-b-2 border-slate-400 bg-white/70">
                        {trafficAxisTicks.map((tick, index) => (
                          <div
                            key={`grid-${tick}-${index}`}
                            className="pointer-events-none absolute left-0 right-0 border-t border-slate-200"
                            style={{ top: `${(index / (trafficAxisTicks.length - 1)) * 100}%` }}
                            aria-hidden="true"
                          />
                        ))}

                        <div className="absolute inset-0 flex items-end gap-1 md:gap-2 px-1.5 md:px-2">
                          {trendViews.map((item) => {
                            const heightPercent = Math.max(2.5, (Number(item.views || 0) / trafficAxisMax) * 100);
                            return (
                              <div
                                key={item.date}
                                className="group relative flex-1 min-w-0 h-full flex items-end justify-center"
                              >
                                <div
                                  className="relative w-full max-w-10 rounded-t-md bg-gradient-to-t from-[#0A66C2] to-[#42a5ff] shadow-[0_6px_15px_rgba(10,102,194,0.14)] transition-[height,filter] duration-300 ease-out group-hover:brightness-110"
                                  style={{ height: `${heightPercent}%` }}
                                  title={`${item.label || item.date}: ${item.views} views`}
                                >
                                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-slate-900 text-white px-2 py-1 text-[9px] font-bold whitespace-nowrap z-20">
                                    {formatNumber(item.views)} views
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="relative h-10 mt-1.5 flex gap-1 md:gap-2 px-1.5 md:px-2">
                        {trendViews.map((item, index) => {
                          const showLabel =
                            index % trafficLabelStep === 0 || index === trendViews.length - 1;
                          return (
                            <div key={`x-${item.date}`} className="flex-1 min-w-0 text-center">
                              {showLabel && (
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-600 tabular-nums whitespace-nowrap">
                                  {item.label || item.date?.slice(5) || "—"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 -mt-1">
                        {trafficXAxisTitle}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#15223c] p-6 text-white border border-white/5 shadow-lg shadow-slate-900/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/70">Engagement insight</p>
            <div className="flex items-end justify-between gap-5 mt-4">
              <div>
                <p className="text-3xl font-black tabular-nums">{avgViewsPerVisitor.toFixed(1)}</p>
                <p className="text-sm text-slate-400 mt-1">Average page views per visitor</p>
              </div>
              <Users size={30} className="text-blue-300/50" />
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#0f766e] p-6 text-white border border-white/5 shadow-lg shadow-emerald-900/10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/80">Lead conversion</p>
            <div className="flex items-end justify-between gap-5 mt-4">
              <div>
                <p className="text-3xl font-black tabular-nums">{downloadConversion.toFixed(1)}%</p>
                <p className="text-sm text-emerald-100/70 mt-1">Brochure downloads per recorded page view</p>
              </div>
              <Download size={30} className="text-emerald-200/50" />
            </div>
          </div>
        </div>

        <article className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="p-6 md:p-7 border-b border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Lead activity</p>
              <h2 className="text-xl md:text-2xl font-bold text-slate-950 font-['Chivo'] mt-1">Brochure Download Leads</h2>
              <p className="text-sm text-slate-500 mt-1">
                Details are captured only from visitors who submit the existing brochure download form.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 w-fit">
              <Download size={13} /> {formatNumber(summary.brochure_downloads)} total
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  {['Contact', 'Email', 'Mobile', 'Source Page', 'Downloaded'].map((heading) => (
                    <th key={heading} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(summary.recent_brochure_downloads || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-14 text-center text-sm text-slate-400">
                      No brochure downloads recorded yet.
                    </td>
                  </tr>
                ) : (
                  summary.recent_brochure_downloads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0A66C2] flex items-center justify-center text-xs font-black uppercase shrink-0">
                            {(lead.name || '?').slice(0, 1)}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{lead.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{lead.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{lead.mobile || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {lead.path || '/'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

      </section>
    </main>
  );
}
