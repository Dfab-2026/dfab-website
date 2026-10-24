import { Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { useReveal } from "../hooks/useReveal";
import axios from "axios";
import { getApiBase } from "../utils/backendApi";

import { MapPin, Mail, Phone, CheckCircle, ArrowRight, Users, Award, Zap, Settings } from "lucide-react";

const API = getApiBase();

const DEFAULT_OPENINGS = [
  {
    id: "tig-welder",
    role: "TIG Welder",
    type: "Full Time",
    location: "Peenya, Bengaluru",
    experience: "3–8 years",
    desc: "Experienced TIG welder for stainless steel and precision fabrication projects. Must be capable of 2G/3G/6G positions.",
    requirements: [
      "ASME IX or AWS certified welder (preferred)",
      "Proficient in TIG welding of SS, Aluminum, CS",
      "Experience with pressure vessel / pipeline fabrication",
      "Ability to read and interpret drawings",
    ],
  },
  {
    id: "fabricator",
    role: "Sheet Metal Fabricator",
    type: "Full Time",
    location: "Peenya, Bengaluru",
    experience: "2–5 years",
    desc: "Skilled fabricator for cutting, forming, and assembling sheet metal components as per drawings and specifications.",
    requirements: [
      "Hands-on experience with laser cutting and CNC bending",
      "Ability to read engineering drawings",
      "Familiarity with stainless steel and mild steel fabrication",
      "Attention to dimensional accuracy",
    ],
  },
  {
    id: "cnc-operator",
    role: "CNC Machine Operator",
    type: "Full Time",
    location: "Peenya, Bengaluru",
    experience: "2–6 years",
    desc: "CNC operator for turning and milling operations. Will be responsible for setup, operation, and first-piece inspection.",
    requirements: [
      "Experience with CNC turning / milling machines",
      "Knowledge of G-code and machine setup",
      "Ability to perform in-process inspection",
      "Stainless steel and alloy machining preferred",
    ],
  },
  {
    id: "quality-inspector",
    role: "Quality Control Inspector",
    type: "Full Time",
    location: "Peenya, Bengaluru",
    experience: "3–6 years",
    desc: "QC inspector responsible for in-process and final inspection of fabricated components. Must be proficient with measurement instruments and documentation.",
    requirements: [
      "Proficiency with measuring instruments (vernier, micrometer, CMM)",
      "Familiarity with ISO 9001 quality procedures",
      "Knowledge of welding inspection and visual testing",
      "Experience with quality documentation and reports",
    ],
  },
];

const WHY_DFAB = [
  { icon: <Award size={28} />, title: "ISO Certified & ZED Recognized", desc: "Work at a certified, globally recognized precision manufacturer." },
  { icon: <Users size={28} />, title: "Experienced Team", desc: "Collaborate with skilled engineers and fabricators who have worked on world-class projects." },
  { icon: <Zap size={28} />, title: "Advanced Facility", desc: "Use state-of-the-art fiber laser, CNC machines, and orbital welding systems." },
  { icon: <CheckCircle size={28} />, title: "Growth & Learning", desc: "Real projects, real challenges, and real growth in the precision manufacturing domain." },
];

export default function Careers() {
  const openingsRef = useReveal();
  const whyRef = useReveal();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const loadCareers = async () => {
      try {
        const res = await axios.get(`${API}/careers`);
        const data = Array.isArray(res.data) ? res.data : [];

        const mapped = data.map((job, index) => ({
          id: job.id || `${job.title || "job"}-${index}`.toLowerCase().replace(/\s+/g, "-"),
          role: job.title || job.role || "Untitled Role",
          type: job.type || "Full Time",
          location: job.location || "Peenya, Bengaluru",
          experience: job.experience || "",
          desc: job.description || job.desc || "",
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
        }));

        setJobs(mapped);
      } catch (error) {
        console.error("Failed to fetch careers:", error);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadCareers();

    const handleRefreshCareers = () => {
      loadCareers();
    };

    window.addEventListener("focus", handleRefreshCareers);
    return () => {
      window.removeEventListener("focus", handleRefreshCareers);
    };
  }, []);

  const openings = useMemo(() => {
  if (loadingJobs) return DEFAULT_OPENINGS;
  return jobs;
}, [jobs, loadingJobs]);

  return (
    <main className="bg-white relative">
      {/* ✅ LIGHTER VISIBLE CORNER ADMIN BUTTON (Matches Projects & Blog) */}
      <div className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-all duration-300">
        <Link
          to="/careers/admin"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white/70 hover:text-white hover:bg-[#0A66C2] rounded-lg border border-white/20 hover:border-[#0A66C2] transition-all shadow-lg hover:shadow-blue-500/20 backdrop-blur-sm"
          title="Careers Admin Console"
        >
          <Settings size={14} className="animate-pulse-slow" />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {/* HEADER SECTION - Standardized */}
      <div className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Join Our Team</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">Careers at DFAB</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Be part of a precision manufacturing team that builds components for the world's most demanding industries.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Careers</span>
          </div>
        </div>
      </div>

      {/* Why Work at DFAB */}
      <section className="py-16 md:py-24 bg-slate-50" ref={whyRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 reveal">
            <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Why DFAB</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">
              Why Work With Us
            </h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
              We invest in our people the same way we invest in quality — with purpose, precision, and commitment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {WHY_DFAB.map((item) => (
              <div
                key={item.title}
                className="reveal bg-white border border-slate-200 rounded-md p-6 text-center hover:border-[#0A66C2] hover:shadow-sm transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-[#0A66C2] mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2 font-['Chivo']">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-16 md:py-24" ref={openingsRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 reveal">
            <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Opportunities</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">
              Current Openings
            </h2>
            <p className="text-slate-600 mt-3 max-w-xl mx-auto">
              We are always looking for skilled, passionate professionals to join our growing team.
            </p>
          </div>

          {!loadingJobs && openings.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-6 sm:p-8 md:p-10 text-center reveal">
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-['Chivo']">No openings right now</h3>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto text-sm">
                There are currently no active positions. You can still send your CV and we will contact you when a suitable role opens.
              </p>
              <a
                href="mailto:info@dfab.in?subject=General Application - DFAB Careers"
                className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-7 py-3 rounded-sm font-semibold hover:bg-[#084e96] transition-colors"
              >
                <Mail size={16} /> Send Your CV
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
              {openings.map((job) => (
                <div
                  key={job.id}
                  className="reveal bg-white border border-slate-200 rounded-md p-7 hover:border-[#0A66C2] hover:shadow-md transition-all duration-300"
                  data-testid={`career-card-${job.id}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 font-['Chivo']">{job.role}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} /> {job.location}
                        </span>
                        <span className="text-xs bg-blue-50 text-[#0A66C2] font-semibold px-2.5 py-1 rounded-full">
                          {job.type}
                        </span>
                        {job.experience && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                            {job.experience}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-5">{job.desc}</p>

                  {job.requirements?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Requirements
                      </p>
                      <ul className="space-y-1.5">
                        {job.requirements.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle size={13} className="text-[#0A66C2] shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={`mailto:info@dfab.in?subject=Job Application - ${encodeURIComponent(job.role)}`}
                    className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-[#084e96] transition-colors"
                    data-testid={`apply-btn-${job.id}`}
                  >
                    Apply Now <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Action Footer Spacer */}
          <div className="mt-20 border-t border-slate-100"></div>
        </div>
      </section>

      {/* Contact for Careers */}
      <div className="bg-[#0A66C2] py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white text-center md:text-left">
            <p className="font-semibold">Questions about careers?</p>
            <p className="text-blue-200 text-sm">Reach out to our HR team</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:info@dfab.in"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-sm text-sm font-medium transition-colors"
            >
              <Mail size={15} /> info@dfab.in
            </a>
            <a
              href="tel:+919187638186"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-sm text-sm font-medium transition-colors"
            >
              <Phone size={15} /> 9187638186
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}