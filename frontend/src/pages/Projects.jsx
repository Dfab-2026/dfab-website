import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Settings, Target, RefreshCw } from "lucide-react";
import { SERVICES as ALL_SERVICES } from "./Services";
import projectProductPlaceholder from "../assets/images/project-product-placeholder.webp";
import { fetchPublishedProjects } from "../utils/projectsApi";

export default function Projects() {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const isProjectsOnly = location.hash === "#projects";
  const isServicesOnly = location.hash === "#services";
  const isFullPage = !location.hash;

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer;

    const loadProjects = async (allowRetry = true) => {
      setProjectsError("");
      try {
        const databaseProjects = await fetchPublishedProjects({
          signal: controller.signal,
          timeoutMs: 75000,
        });
        if (controller.signal.aborted) return;
        setProjects(databaseProjects);
        setLoadingProjects(false);
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error("Failed to fetch projects from MongoDB:", err);
        if (allowRetry) {
          retryTimer = window.setTimeout(() => loadProjects(false), 2500);
          return;
        }
        setProjects([]);
        setProjectsError("Could not load published projects from the database.");
        setLoadingProjects(false);
      }
    };

    loadProjects();

    return () => {
      controller.abort();
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  const processedProjects = useMemo(() => {
    return projects.map((project) => {
      const pointsArray = project.desc
        ? project.desc
            .split(/(?<=\.)\s+|\n/)
            .map((point) => point.trim())
            .filter((point) => point.length > 0)
        : [];
      return { ...project, points: pointsArray };
    });
  }, [projects]);

  useEffect(() => {
  const targetId =
    location.hash === "#projects"
      ? "projects-header"
      : location.hash === "#services"
      ? "services-header"
      : null;

  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      setTimeout(() => {
        const navbarOffset = 90; // adjust if your navbar is taller/smaller
        const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
        const scrollTo = elementTop - navbarOffset;

        window.scrollTo({
          top: scrollTo,
          left: 0,
          behavior: "instant",
        });
      }, 0);
    }
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
}, [location]);

  return (
    <main className="bg-white relative">
      {/* ADMIN ACCESS */}
      <div className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-all duration-300">
        <Link
          to="/admin/projects"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white/70 hover:text-white hover:bg-[#0A66C2] rounded-lg border border-white/20 hover:border-[#0A66C2] transition-all shadow-lg backdrop-blur-sm"
        >
          <Settings size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {(isFullPage || isProjectsOnly) && (
        <>
          {/* HEADER SECTION - Standardized */}
          <div className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
            <div className="max-w-7xl mx-auto w-full">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">
                Portfolio
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">
                Our Projects
              </h1>
              <p className="text-slate-400 mt-3 max-w-2xl">
                Explore our portfolio showcasing precision fabrication,
                advanced welding, and engineering excellence across multiple industrial sectors.
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-white">Projects</span>
              </div>
            </div>
          </div>

          {/* SPACING BETWEEN PROJECTS HEADER AND PRODUCT VISUAL */}
          <div className="h-10 md:h-14 lg:h-16 bg-white" aria-hidden="true" />

          {/* STATIC PRODUCT VISUAL - full-width replacement for the video area */}
          <section className="w-full overflow-hidden bg-black">
            <img
              src={projectProductPlaceholder}
              alt="DFAB fabricated stainless steel product"
              className="block h-auto w-full object-contain object-center"
            />
          </section>

          {/* PROJECTS GRID */}
          <section id="projects-section" className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              {loadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 rounded-xl min-h-[420px] md:h-[520px] animate-pulse"
                    />
                  ))}
                </div>
              ) : projectsError ? (
                <div className="text-center py-16 border border-red-100 bg-red-50 rounded-xl">
                  <h3 className="text-xl font-bold text-red-800 font-['Chivo']">
                    Projects Database Unavailable
                  </h3>
                  <p className="text-red-600 mt-3 max-w-xl mx-auto">{projectsError}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 inline-flex items-center gap-2 bg-[#0A66C2] text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#084e96] transition-colors"
                  >
                    <RefreshCw size={15} /> Retry
                  </button>
                </div>
              ) : processedProjects.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-bold text-slate-900 font-['Chivo']">
                    No Projects Available
                  </h3>
                  <p className="text-slate-500 mt-3 max-w-xl mx-auto">
                    Projects will appear here once they are added from the admin panel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {processedProjects.map((p) => (
                    <div
                      key={p.id}
                      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col min-h-[480px] md:h-[520px]"
                    >
                      {/* IMAGE BOX WITH CLEAR BLUE TAG */}
                      <div className="relative overflow-hidden h-48 shrink-0 bg-slate-100">
                        {p.img ? (
                          <img
                            src={p.img}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center px-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            DFAB Project
                          </div>
                        )}

                        {/* FIXED OVERLAY TAG (NO CUTS) */}
                        <div className="absolute top-4 left-4 z-20">
                          <span className="bg-[#0A66C2] text-white text-[10px] font-bold px-4 py-1.5 rounded-md shadow-lg uppercase tracking-widest border border-white/10 block">
                            {p.tag}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                      </div>

                      {/* DOCUMENT CONTENT AREA */}
                      <div className="p-6 flex flex-col flex-grow overflow-hidden bg-white">
                        <h3 className="text-lg font-extrabold text-slate-900 mb-4 font-['Chivo'] border-b border-slate-100 pb-3 leading-tight shrink-0">
                          {p.title}
                        </h3>

                        {/* SCROLLABLE BULLET LIST */}
                        <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar">
                          <ul className="space-y-4">
                            {p.points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="mt-1.5 shrink-0">
                                  <Target size={12} className="text-[#0A66C2]" />
                                </div>
                                <span className="text-sm text-slate-700 leading-relaxed text-justify antialiased font-medium">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Document Footer Separator */}
                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end shrink-0">
                          <div className="w-8 h-1 bg-slate-100 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA SECTION */}
              <div className="mt-16">
                <div className="w-full bg-[#0A66C2] rounded-xl p-6 sm:p-8 md:p-10 text-center shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-3 font-['Chivo']">
                    Have a Project in Mind?
                  </h2>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-white text-[#0A66C2] px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                  >
                    Discuss Your Project <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {(isFullPage || isServicesOnly) && (
        <>
          {/* ✅ ADDED ID */}
          <div id="services-header" className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
            <div className="max-w-7xl mx-auto w-full">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">
                Our Services
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">
                What We Do
              </h1>
              <p className="text-slate-400 mt-3 max-w-2xl">
                Delivering precision fabrication solutions tailored to industry needs.
                From design to manufacturing, we ensure quality, reliability, and efficiency.
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-white">Services</span>
              </div>
            </div>
          </div>

          <section id="services" className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ALL_SERVICES.map((service) => (
                  <div
                    key={service.title}
                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-[400px] md:h-[420px] flex flex-col hover:shadow-xl transition-all duration-500"
                  >
                    <div className="h-48 shrink-0 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow overflow-hidden">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 font-['Chivo'] border-b border-slate-100 pb-2">
                        {service.title}
                      </h3>
                      <div className="overflow-y-auto custom-scrollbar flex-grow pr-2">
                        <p className="text-sm text-slate-600 leading-6 text-justify">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* COMPONENT STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0A66C2; }

        li span {
          display: block;
        }
      `}</style>
    </main>
  );
}