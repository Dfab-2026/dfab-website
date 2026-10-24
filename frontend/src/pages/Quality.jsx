import { Link } from "react-router-dom";

import { Award, CheckCircle, Shield, Globe, ArrowRight } from "lucide-react";
import { useReveal } from "../hooks/useReveal";

const CERTIFICATIONS = [
  {
    id: "iso",
    badge: "ISO 9001",
    full: "ISO 9001:2015",
    title: "Quality Management System",
    desc: "DFAB is ISO 9001:2015 certified, demonstrating our commitment to consistent quality, customer satisfaction, and continuous improvement across all manufacturing processes.",
    points: [
      "Documented quality management procedures",
      "Systematic process controls and monitoring",
      "Regular internal and external audits",
      "Continual improvement culture embedded at every level",
    ],
    color: "bg-blue-50 text-[#0A66C2] border-blue-200",
    icon: <Award size={32} />,
  },
  {
    id: "zed",
    badge: "ZED",
    full: "Zero Defect Zero Effect",
    title: "ZED Certified Manufacturer",
    desc: "DFAB holds the ZED (Zero Defect Zero Effect) certification from the Ministry of MSME, Government of India, recognizing our world-class quality and environmentally responsible manufacturing practices.",
    points: [
      "Zero defect manufacturing processes",
      "Environmentally sustainable production",
      "Government of India recognition for quality excellence",
      "Compliance with global quality benchmarks",
    ],
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <Shield size={32} />,
  },
  {
    id: "adnoc",
    badge: "ADNOC",
    full: "ADNOC Approved Vendor",
    title: "Approved for ADNOC Projects",
    desc: "DFAB is an approved vendor for Abu Dhabi National Oil Company (ADNOC) projects — one of the most stringent qualification processes in the energy industry, affirming our capability for global, high-criticality fabrication work.",
    points: [
      "Cleared ADNOC's rigorous vendor qualification process",
      "Eligible for oil & gas projects in the UAE",
      "Demonstrates global export readiness",
      "Validates compliance with international energy standards",
    ],
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Globe size={32} />,
  },
  {
    id: "welding",
    badge: "WPS",
    full: "Welding Procedure Specifications",
    title: "Welding Qualifications",
    desc: "DFAB maintains qualified Welding Procedure Specifications (WPS) and Welder Performance Qualifications (WPQ) in accordance with international standards, ensuring every weld meets defined mechanical and quality requirements.",
    points: [
      "Qualified WPS per ASME IX and AWS D1.1 standards",
      "WPQ certified welders for multiple processes",
      "6G position welding qualification",
      "GTAW, GMAW, Orbital, and Arc process qualifications",
    ],
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: <CheckCircle size={32} />,
  },
];

const QUALITY_APPROACH = [
  { num: "01", title: "Incoming Material Inspection", desc: "All raw materials are verified against material test certificates (MTCs) before entering production." },
  { num: "02", title: "In-Process Quality Control", desc: "Dimensional checks and visual inspections at each stage of fabrication to catch deviations early." },
  { num: "03", title: "Welding Quality Assurance", desc: "All critical welds are performed per approved WPS by certified welders and verified by QC engineers." },
  { num: "04", title: "Final Inspection & Documentation", desc: "100% final inspection with full dimensional reports, NDT records, and quality dossiers." },
];

export default function Quality() {
  const certRef = useReveal();
  const approachRef = useReveal();
  const exportRef = useReveal();

  return (
    <main className="bg-white">
      {/* HEADER SECTION - Standardized */}
      <div className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Standards & Compliance</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">Quality & Certifications</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
Every product leaving our facility meets stringent quality standards. Our commitment to global-grade manufacturing excellence.          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Quality & Certifications</span>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <section className="py-16 md:py-24" ref={certRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Our Credentials</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">
              Certifications & Approvals
            </h2>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              Recognized by leading quality bodies and global industrial clients for consistent, world-class manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.id}
                className="reveal bg-white border border-slate-200 rounded-md p-8 hover:border-[#0A66C2] hover:shadow-md transition-all duration-300"
                data-testid={`cert-card-${cert.id}`}
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className={`w-20 h-16 border rounded-md flex flex-col items-center justify-center shrink-0 ${cert.color}`}>
                    <span className="font-black text-lg font-['Chivo'] leading-tight">{cert.badge}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wide">{cert.full}</p>
                    <h3 className="text-xl font-bold text-slate-900 mt-1 font-['Chivo']">{cert.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-5">{cert.desc}</p>

                <ul className="space-y-2">
                  {cert.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle size={15} className="text-[#0A66C2] shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Approach */}
      <section className="py-16 md:py-24 bg-[#0F172A]" ref={approachRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Our Methodology</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mt-2 font-['Chivo']">
              Quality at Every Step
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              From raw material to final dispatch — quality is never an afterthought at DFAB.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {QUALITY_APPROACH.map((step, i) => (
              <div key={step.num} className="reveal bg-slate-800 border border-slate-700 hover:border-[#0A66C2] rounded-md p-6 transition-colors duration-300" data-testid={`quality-step-${step.num}`}>
                <div className="text-5xl font-black text-[#0A66C2]/30 font-['Chivo'] mb-3">{step.num}</div>
                <h3 className="text-base font-semibold text-white mb-2 font-['Chivo']">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Readiness */}
      <section className="py-16 md:py-20 bg-white" ref={exportRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-[#0A66C2] to-[#1565C0] rounded-md p-6 sm:p-10 md:p-14 text-center reveal">
            <Globe size={40} className="text-white/60 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white font-['Chivo'] mb-3">
              Open for Global Projects
            </h2>
            <p className="text-blue-100 text-lg mb-2">Engineering Excellence from India</p>
            <p className="text-blue-200/80 max-w-2xl mx-auto text-sm leading-relaxed mb-8">
              As an ADNOC-approved vendor with ZED and ISO 9001 certifications, DFAB is fully equipped to execute projects for clients across the Middle East, Southeast Asia, and beyond.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-[#0A66C2] px-7 py-3 rounded-sm font-semibold hover:bg-blue-50 transition-colors"
                data-testid="quality-contact-btn"
              >
                Discuss a Global Project <ArrowRight size={16} />
              </Link>
              <Link
                to="/capabilities"
                className="inline-flex items-center gap-2 border border-white text-white px-7 py-3 rounded-sm font-semibold hover:bg-white/10 transition-colors"
              >
                View Capabilities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}