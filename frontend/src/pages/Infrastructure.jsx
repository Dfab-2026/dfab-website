import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import img1 from "../assets/images/factory1.jpg";
import img2 from "../assets/images/factory2.jpg";
import img3 from "../assets/images/welding.jpg";
import img4 from "../assets/images/fabrication.jpg";

const MACHINES = [
  { name: "GTAW Welding Machines", count: "6+", desc: "For precision stainless steel welding" },
  { name: "GMAW Welding Machines", count: "4+", desc: "For production welding applications" },
  { name: "Conventional Lathe", count: "2", desc: "For turning and machining operations" },
  { name: "Milling Machine", count: "1", desc: "For surface and contour machining" },
  { name: "Radial Drilling Machine", count: "1", desc: "For precision hole-making operations" },
  { name: "Laser Cutting System", count: "1", desc: "Advanced laser technology for precision cuts" },
  { name: "5 Ton EOT Crane", count: "1", desc: "For heavy lifting and assembly" },
  { name: "Grinding Machines", count: "2", desc: "For surface finishing operations" },
];

const CAPABILITIES = [
  "Pressure vessel fabrication up to high-pressure specifications",
  "Pipeline welding at 6G positions with 100% radiographic testing",
  "Heavy engineering fabrication up to 5 tons per assembly",
  "Stainless steel, carbon steel and aluminium fabrication",
  "Stellite and hardfacing welding for wear-resistant surfaces",
  "CNC and conventional precision machining",
  "Custom die refurbishment and life extension",
  "On-site and off-site installation services",
];

export default function Infrastructure() {
  return (
    <main className="bg-white">
      {/* HEADER SECTION - Standardized */}
      <div className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Our Facility</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">Infrastructure</h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Explore our state-of-the-art 14000 sqft manufacturing facility equipped with advanced precision machinery and heavy-duty fabrication equipment.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Overview - Fixed Alignment */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            {/* Left Content */}
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Our Workshop</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-6 font-['Chivo'] leading-tight">
                State-of-the-Art 14000 sqft Precision Facility
              </h2>
              <p className="text-slate-600 leading-relaxed mb-5">
                Located in the prime Peenya Industrial Area, Bengaluru, our modern workshop is equipped with advanced machinery and operated by a highly skilled engineering team.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Our facility is designed to handle end-to-end fabrication projects — from raw material processing to final quality inspection and delivery.
              </p>
              
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                {[
                  { value: "14000 sqft", label: "Workshop Area" },
                  { value: "5 Tons", label: "Crane Capacity" },
                  { value: "GTAW,GMAW", label: "Welding Machines" },
                  { value: "ISO", label: "9001:2015 Certified" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl p-5 text-center border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="text-2xl font-bold text-[#0A66C2] font-['Chivo']">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Images - Balanced Alignment */}
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4 h-full content-center">
  <img
    src={img1}
    alt="Factory Overview"
    className="rounded-xl h-48 md:h-64 w-full object-cover shadow-sm"
  />

  <img
    src={img2}
    alt="Machinery"
    className="rounded-xl h-48 md:h-64 w-full object-cover shadow-sm mt-8"
  />

  <img
    src={img3}
    alt="Welding"
    className="rounded-xl h-48 md:h-64 w-full object-cover shadow-sm -mt-8"
  />

  <img
    src={img4}
    alt="Steel Fabrication"
    className="rounded-xl h-48 md:h-64 w-full object-cover shadow-sm"
  />
</div>
          </div>

          {/* Machines Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-widest">Asset List</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">Machines & Equipment</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {MACHINES.map((m) => (
                <div
                  key={m.name}
                  className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-[#0A66C2] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-3xl font-black text-[#0A66C2] font-['Chivo'] mb-2">{m.count}</div>
                  <h4 className="font-bold text-slate-900 mb-2">{m.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities Section */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-widest">Our Expertise</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 font-['Chivo']">Workshop Capabilities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {CAPABILITIES.map((cap) => (
                <div key={cap} className="flex items-center gap-4 p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all">
                  <CheckCircle size={20} className="text-[#0A66C2] shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* In-house Talent */}
          <div className="bg-[#0F172A] rounded-3xl p-8 md:p-14 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A66C2] opacity-5 rounded-full -mr-32 -mt-32"></div>
            
            <div className="text-center mb-12 relative z-10">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">Our Backbone</span>
              <h2 className="text-3xl font-bold text-white mt-2 font-['Chivo']">In-House Talent</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {[
                { title: "Skilled Welders", desc: "Qualified for 6G positions — the highest welding qualification for pipe welding." },
                { title: "Project Engineers", desc: "Experienced engineers to facilitate product development from design to delivery." },
                { title: "Quality Inspectors", desc: "Dedicated QA team ensuring every product meets customer and industry standards." },
              ].map((t) => (
                <div key={t.title} className="bg-white/5 backdrop-blur-sm rounded-2xl p-7 border border-white/10 hover:bg-white/10 transition-colors">
                  <h4 className="text-white font-bold text-lg mb-4 font-['Chivo'] border-b border-white/10 pb-3">{t.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}