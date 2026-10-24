import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Wrench,
  Cpu,
  Layers,
  Settings,
  FlaskConical,
  Microscope,
  Code2,
  Box,
  Compass,
} from "lucide-react";
import { useState } from "react";
import InquireModal from "../components/InquireModal";

const CAPABILITIES = [
  {
    id: "laser-cutting",
    icon: <Zap size={36} />,
    title: "Laser Cutting",
    subtitle: "High-Precision Fiber Laser Systems",
    desc: "Our high-precision fiber laser cutting systems enable accurate cutting of sheet metal components with tight tolerances and excellent edge quality.",
    keyCapabilities: [
      "Precision cutting of stainless steel, mild steel, and specialty alloys",
      "High accuracy for thin and medium thickness sheets",
      "Burr-free edges minimizing secondary finishing operations",
    ],
    applications: ["Precision sheet metal components", "Structural fabrication parts"],
  },
  {
    id: "cnc-bending",
    icon: <Layers size={36} />,
    title: "CNC Bending",
    subtitle: "CNC Press Brake Technology",
    desc: "Our CNC press brake bending capability ensures high accuracy and consistency in forming operations.",
    keyCapabilities: [
      "CNC controlled bending",
      "Complex multi-bend components",
      "Multi-axis machining for complex geometries",
    ],
    applications: ["Industrial equipment housings", "Structural assemblies"],
  },
  {
    id: "welding",
    icon: <Wrench size={36} />,
    title: "Welding Expertise",
    subtitle: "GTAW | GMAW | MMAW | Laser | Orbital | Arc Welding",
    desc: "Welding is one of DFAB's core strengths, supported by qualified welders, controlled procedures, and strong quality practices.",
    keyCapabilities: [
      "GTAW welding for stainless steel and precision work",
      "GMAW welding for fabrication assemblies",
      "Laser welding for minimal distortion",
    ],
    applications: ["Stainless steel fabrication", "Pressure equipment components"],
  },
  {
    id: "cnc-machining",
    icon: <Cpu size={36} />,
    title: "CNC Machining",
    subtitle: "Precision Turning & Milling",
    desc: "DFAB provides precision CNC machining services to produce components with tight tolerances and high dimensional accuracy.",
    keyCapabilities: [
      "Precision turning and milling",
      "Machining of stainless steel and engineering materials",
      "Tight tolerance manufacturing",
    ],
    applications: ["Precision mechanical components", "Industrial equipment parts"],
  },
  {
    id: "heavy-fabrication",
    icon: <Settings size={36} />,
    title: "Heavy Fabrication",
    subtitle: "Structural & Industrial Assemblies",
    desc: "We specialize in heavy fabrication of stainless steel and structural assemblies, supported by experienced engineers and skilled fabrication teams.",
    keyCapabilities: [
      "Large structural assemblies",
      "Thick material welding",
      "Industrial equipment structures",
    ],
    applications: ["Industrial machinery frames", "Process equipment structures"],
  },
  {
    id: "assembly-testing",
    icon: <FlaskConical size={36} />,
    title: "High Precision Assembly & Testing",
    subtitle: "Complete Assembly & Functional Verification",
    desc: "DFAB provides complete assembly and functional testing to ensure that manufactured systems meet customer requirements and perform reliably.",
    keyCapabilities: [
      "Mechanical assembly of complex systems",
      "Leak testing and pressure testing",
      "Dimensional verification",
    ],
    applications: ["Industrial equipment systems", "Process equipment modules"],
  },
];

const RD_ROLES = [
  { title: "Designing", dept: "CAD/CAM & 3D Prototyping", icon: <Compass size={20} /> },
  { title: "Research", dept: "Consumer problem solutioning", icon: <Microscope size={20} /> },
  { title: "Product Development", dept: "Lifecycle & Strategy", icon: <Box size={20} /> },
  { title: "Software Engineer", dept: "Digital Systems & IoT", icon: <Code2 size={20} /> },
];

function CapabilityCard({ cap }) {
  return (
    <div className="h-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#0A66C2]/30 transition-all duration-300 flex flex-col overflow-hidden reveal group">
      <div className="p-5 sm:p-7 lg:p-8 flex flex-col h-full">
        
        {/* Header - Fixed Height for alignment */}
        <div className="flex items-start gap-4 sm:gap-5 min-h-[80px] sm:h-[80px] mb-4">
          {cap.icon && (
            <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-[#0A66C2] shrink-0 group-hover:bg-[#0A66C2] group-hover:text-white transition-colors duration-300">
              {cap.icon}
            </div>
          )}
          <div className="flex flex-col justify-center h-full">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 font-['Chivo'] leading-tight">
              {cap.title}
            </h3>
            <p className="text-[10px] font-black text-[#0A66C2] uppercase tracking-widest mt-1">
              {cap.subtitle}
            </p>
          </div>
        </div>

        {/* Description - Fixed Height to keep list start point equal */}
        <div className="min-h-[90px] sm:h-[90px] mb-6">
          <p className="text-base lg:text-[17px] text-slate-600 leading-relaxed line-clamp-3">
            {cap.desc}
          </p>
        </div>

        {/* Key Capabilities - Grows to fill space */}
        <div className="flex-grow mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Key Capabilities
          </p>
          <ul className="space-y-3">
            {cap.keyCapabilities.map((k, index) => (
              <li
                key={index}
                className="text-[15px] lg:text-base text-slate-700 leading-tight flex items-start gap-3 min-h-[45px] sm:h-[45px]"
              >
                <CheckCircle size={16} className="text-[#0A66C2] mt-0.5 shrink-0" />
                <span className="line-clamp-2">{k}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Applications - Always pinned to bottom */}
        <div className="pt-6 border-t border-slate-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Applications
          </p>
          <div className="flex flex-wrap gap-2 min-h-[55px] sm:h-[55px] content-start sm:overflow-hidden">
            {cap.applications.map((a, index) => (
              <span
                key={index}
                className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full whitespace-nowrap"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Capabilities() {
  const [showInquire, setShowInquire] = useState(false);
  const capRef = useReveal();
  const rdRef = useReveal();

  return (
    <main className="bg-white">
      {/* HEADER SECTION */}
      <section className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">What We Do</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">
                Manufacturing Capabilities
              </h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Precision-driven manufacturing capabilities built on global standards, featuring advanced fiber laser cutting and specialized welding.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Capabilities</span>
          </div>
        </div>
      </section>

      {/* STICKY QUICK NAVIGATION */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 whitespace-nowrap justify-start">
            {CAPABILITIES.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 rounded-full hover:bg-[#0A66C2] hover:text-white transition-all border border-slate-100"
              >
                {c.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED CAPABILITIES CARDS */}
      <section className="py-24" ref={capRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.2em]">
              Expertise
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">
              End-to-End Manufacturing Solutions
            </h2>
          </div>

          {/* GRID - items-stretch ensures all cards in a row have equal height */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {CAPABILITIES.map((cap) => (
              <div key={cap.id} id={cap.id} className="scroll-mt-32">
                <CapabilityCard cap={cap} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* R&D SECTION */}
      <section className="py-28 bg-[#0F172A] relative overflow-hidden" ref={rdRef}>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0A66C2]/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 reveal">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#0A66C2]/20">
                <Microscope size={14} className="animate-bounce-slow" />
                Technical Innovation Hub
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-['Chivo'] leading-tight">
                Research & <span className="text-[#0A66C2]">Development</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                At DFAB, we bridge traditional craftsmanship with digital innovation by integrating AI-driven quality analysis into our fabrication workflows.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                {[
                  { label: "Consumer Safety Solutions", icon: <Settings size={18} /> },
                  { label: "Air filtration Solutions", icon: <Zap size={18} /> },
                  { label: "Industrial Automation", icon: <Compass size={18} /> },
                  { label: "Digital Monitoring", icon: <Code2 size={18} /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <span className="text-slate-300 font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full reveal">
              {RD_ROLES.map((role, index) => (
                <div key={index} className="group relative bg-white/5 border border-white/10 p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="absolute top-0 left-0 w-[4px] h-full bg-[#0A66C2] shadow-[0_0_20px_#0A66C2] transition-transform duration-700 -translate-y-full group-hover:translate-y-0"></div>
                  <div className="text-[#0A66C2] mb-4 group-hover:scale-110 transition-transform duration-500">{role.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-1 group-hover:text-[#0A66C2] transition-colors duration-300">{role.title}</h3>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{role.dept}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 bg-white text-center border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 font-['Chivo']">Build with Precision</h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg leading-relaxed">Partner with an engineering team that understands the intersection of quality and digital innovation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setShowInquire(true)} className="px-8 py-4 bg-[#0A66C2] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#084e96] transition-all shadow-xl shadow-blue-100 flex items-center gap-3">
              Start Inquiry <ArrowRight size={18} />
            </button>
            <Link to="/contact" className="px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {showInquire && <InquireModal onClose={() => setShowInquire(false)} />}
    </main>
  );
}