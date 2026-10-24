import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CheckCircle,
  Compass,
  Crosshair,
  Linkedin,
  Mail,
  Settings,
} from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import factoryImg from "../assets/images/abtfac.jpg";
import jithedraImg from "../assets/images/leaders/Jithendra.jpg";
import sureshImg from "../assets/images/leaders/Suresh.jpg";
import pramodImg from "../assets/images/leaders/pramod.jpg";

const LEADERS = [
  {
    name: "JITHENDRA BABU K",
    role: "Chief Executive Officer",
    img: jithedraImg,
    linkedin: "https://www.linkedin.com/in/jithendrababu-k-48603b77/",
    email: "jithendrababu.dfab@gmail.com",
    bio: "Highly experienced in the profession of welding and fabrication, with 30+ years of industrial experience executing projects in India and abroad. Niche skill in satisfying customer requirements.",
    expertise: ["Technical Welding Expertise", " Global Client Relations"],
    greetings: [
      "Welcome to DFAB.",
      "Glad to have you here.",
      "Let us build excellence together.",
      "Precision begins with leadership.",
    ],
  },
  {
    name: "SURESH KUMAR TS",
    role: "Chief Operating Officer",
    img: sureshImg,
    linkedin: "https://www.linkedin.com/in/sureshkumarts/",
    email: "sureshkumar.dfab@gmail.com",
    bio: "Experienced tooling engineer with 18+ years of product design background & core experience in OEM practice for product design and development, strong in process implementation and new product development.",
    expertise: ["Product Design", "Process Optimization"],
    greetings: [
      "Engineering ideas into reality.",
      "Great to connect with you.",
      "Innovation starts with precision.",
      "Welcome to our technical world.",
    ],
  },
  {
    name: "PRAMOD SHETTY",
    role: "Chief Visionary Officer",
    img: pramodImg,
    linkedin: "https://www.linkedin.com/in/pramod-shetty-7086b011/",
    email: "pramod.shetty@dfab.in",
    bio: "Dynamic leader, with 20+ years of industry experience in executing engineering product development & manufacturing projects from concept to production.",
    expertise: ["Business Development", "People Leader"],
    greetings: [
      "Quality drives every project.",
      "Welcome, excellence matters here.",
      "Glad you are here with us.",
      "Consistency creates confidence.",
    ],
  },
];

export default function About() {
  const storyRef = useReveal();
  const vmqRef = useReveal();
  const facilRef = useReveal();
  const leaderRef = useReveal();

  const [activeCard, setActiveCard] = useState(null);
  const [hoverMsg, setHoverMsg] = useState("");

  const getRandomGreeting = (leader) => {
    const msgs = leader.greetings || [];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <main className="bg-white relative">
      {/* ADMIN ACCESS - reuses the same admin authentication as Projects */}
      <div className="absolute top-4 right-4 z-40 opacity-50 hover:opacity-100 transition-all duration-300">
        <Link
          to="/admin/analytics"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white/70 hover:text-white hover:bg-[#0A66C2] rounded-lg border border-white/20 hover:border-[#0A66C2] transition-all shadow-lg backdrop-blur-sm"
        >
          <Settings size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {/* HEADER SECTION */}
      <div className="bg-[#0F172A] min-h-[240px] sm:min-h-[260px] flex items-center px-4 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">
            About DFAB
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 font-['Chivo']">
            Who We Are
          </h1>
          <p className="text-slate-400 mt-3 max-w-2xl">
            We combine decades of engineering expertise with advanced manufacturing
            technology to deliver high-integrity solutions for global sectors.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">About</span>
          </div>
        </div>
      </div>

      {/* About Content */}
      <section className="py-16 md:py-24" ref={storyRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Our Story */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-stretch mb-20">
            <div className="reveal-left flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">
                  Our Story
                </span>

                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-5 font-['Chivo']">
                  Precision Fabrication Since 2018
                </h2>

                <p className="text-slate-600 leading-relaxed mb-5">
                  DFAB Stainless System Pvt Ltd was established on{" "}
                  <strong>28 September 2018</strong>. We are an{" "}
                  <strong>ISO 9001:2015 certified</strong> fabrication company,
                  positioned in the prime Peenya Industrial Area, Bengaluru.
                </p>

                <p className="text-slate-600 leading-relaxed mb-5">
                  We offer end-to-end solutions in the field of equipment
                  fabrication and machining. With a 14000 sq-ft operating built-up
                  area, we are equipped with a highly skilled team with domain
                  experience to craft services for your products.
                </p>

                <p className="text-slate-600 leading-relaxed mb-8">
                  We have significant in-house talent to provide services like
                  pressure vessel fabrication, high-pressure pipeline welding,
                  heavy engineering and component machining.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#0A66C2] text-center leading-tight">
                      ISO
                      <br />
                      9001:2015
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      ISO 9001:2015 Certified
                    </div>
                    <div className="text-sm text-slate-500">
                      Quality Management System
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-green-50 border border-green-200 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-green-700 text-center leading-tight">
                      ZED
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      ZED Certified
                    </div>
                    <div className="text-sm text-slate-500">
                      Zero Defect Zero Effect — Govt. of India
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-yellow-50 border border-yellow-200 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-yellow-700 text-center leading-tight">
                      ADNOC
                      <br />
                      Approved
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      ADNOC Approved Vendor
                    </div>
                    <div className="text-sm text-slate-500">
                      Qualified for International Projects
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-right h-full flex">
              <div className="w-full h-full overflow-hidden rounded-md shadow-lg">
                <img
                  src={factoryImg}
                  alt="DFAB Factory"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Vision, Mission, Quality Policy */}
          <div
            className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 mb-20"
            ref={vmqRef}
          >
            {[
              {
                title: "Vision",
                icon: <Compass size={21} strokeWidth={1.8} />,
                text: [
                  "To be a one-stop solution",
                  "for fabrication across domains,",
                  "delivering trusted quality and",
                  "value to every customer by 2030.",
                ],
                accent: "blue",
              },
              {
                title: "Mission",
                icon: <Crosshair size={21} strokeWidth={1.8} />,
                text: [
                  "Turn customer ideas into",
                  "world-class products through",
                  "reliable fabrication and",
                  "assured quality, time, and cost.",
                ],
                accent: "amber",
              },
              {
                title: "Quality Policy",
                icon: <BadgeCheck size={21} strokeWidth={1.8} />,
                text: [
                  "Deliver machined and fabricated",
                  "products that meet customer",
                  "expectations, arrive on time,",
                  "and improve continuously.",
                ],
                accent: "emerald",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`group relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-[0_3px_14px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)] sm:p-7 ${
                  item.accent === "blue"
                    ? "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[#0A66C2] hover:border-blue-200"
                    : item.accent === "amber"
                    ? "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-amber-500 hover:border-amber-200"
                    : "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-emerald-600 hover:border-emerald-200"
                }`}
                data-testid={`about-${item.title.toLowerCase()}-card`}
              >
                <div className="relative mb-6 flex justify-center">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-md transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110 ${
                      item.accent === "blue"
                        ? "bg-blue-50 text-[#0A66C2]"
                        : item.accent === "amber"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="absolute right-0 top-1 font-mono text-xs tracking-wider text-slate-400">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <h3 className="mb-3 flex min-h-[3.5rem] items-center justify-center text-xl font-bold leading-tight text-slate-900 font-['Chivo']">
                    {item.title}
                  </h3>
                  <p className="font-['Inter'] text-sm leading-7 text-slate-600">
                    {item.text.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  {item.detail && (
                    <p className="mt-3 font-['Inter'] text-sm leading-6 text-slate-500">
                      {item.detail}
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-6">
                  <div className="h-px w-full bg-slate-100" />
                  <div
                    className={`mt-4 h-1 w-8 rounded-full transition-all duration-300 group-hover:w-14 ${
                      item.accent === "blue"
                        ? "bg-[#0A66C2]/70"
                        : item.accent === "amber"
                        ? "bg-amber-500/80"
                        : "bg-emerald-600/75"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Leadership Team */}
<div ref={leaderRef} className="relative py-10 bg-white">
  <div className="text-center mb-16 reveal">
    <span className="inline-flex items-center px-4 py-1 rounded-full border border-[#0A66C2]/15 bg-[#0A66C2]/5 text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.18em]">
      Meet the Team
    </span>

    <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-5 font-['Chivo']">
      Our Leadership Team
    </h2>

    <p className="text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
      Driven by experience, engineering precision, and a commitment to excellence in industrial fabrication.
    </p>
  </div>

  <div className="max-w-7xl mx-auto px-4 md:px-8">
    <div className="flex flex-wrap lg:flex-nowrap justify-center gap-8">
      {LEADERS.map((leader) => (
        <div
          key={leader.name}
          onMouseEnter={() => {
            setHoverMsg(getRandomGreeting(leader));
            setActiveCard(leader.name);
          }}
          onMouseLeave={() => setActiveCard(null)}
          className="group relative w-full sm:w-[calc(50%-1rem)] lg:w-full lg:flex-1 lg:max-w-[390px] min-h-[360px] rounded-[24px] border border-[#0A66C2]/20 bg-[#0A66C2]/5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg overflow-hidden"
        >
          {/* 🔵 Moving Border - Continuous Flow */}
<div className="absolute inset-0 pointer-events-none rounded-[24px] overflow-hidden">

  {/* TOP */}
  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0A66C2] to-transparent animate-[flowX_2s_linear_infinite]" />

  {/* RIGHT */}
  <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#0A66C2] to-transparent animate-[flowY_2s_linear_infinite]" />

  {/* BOTTOM */}
  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0A66C2] to-transparent animate-[flowXReverse_2s_linear_infinite]" />

  {/* LEFT */}
  <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-[#0A66C2] to-transparent animate-[flowYReverse_2s_linear_infinite]" />

</div>

          {/* Image + Message */}
          <div className="relative pt-16 flex flex-col items-center">
            {/* Message Above Image */}
            {activeCard === leader.name && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 animate-[fadeUp_0.3s_ease] pointer-events-none">
                <div className="relative bg-[#0A66C2] text-white shadow-md rounded-xl px-4 py-2 text-center max-w-[220px]">
                  <p className="text-xs text-white leading-relaxed">
                    {hoverMsg}
                  </p>

                  {/* Center Arrow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A66C2] rotate-45" />
                </div>
              </div>
            )}

            {/* Image */}
            <div className="relative mt-6">
              <div className="w-44 h-44 rounded-full p-[5px] bg-gradient-to-br from-[#0A66C2] via-sky-400 to-slate-300 shadow-md">
                <div className="w-full h-full rounded-full p-[4px] bg-black">
                  <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-white bg-slate-100">
                    <img
                      src={leader.img}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>

              {/* ✨ Star with Continuous Big Scatter */}
<div className="absolute -bottom-3 -right-3 w-14 h-14 flex items-center justify-center pointer-events-none">

  {/* Main Star */}
  <span className="relative z-10 text-[#0A66C2] text-3xl drop-shadow-[0_0_10px_#0A66C2]">
    ✦
  </span>

  {/* Scatter Stars (Bigger + Continuous) */}
  <span className="absolute text-[14px] text-blue-400 opacity-0 group-hover:opacity-100 group-hover:animate-[sparkTL_1s_linear_infinite]">✦</span>
  <span className="absolute text-[13px] text-sky-400 opacity-0 group-hover:opacity-100 group-hover:animate-[sparkTR_1s_linear_infinite]">✧</span>
  <span className="absolute text-[14px] text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:animate-[sparkBL_1s_linear_infinite]">✦</span>
  <span className="absolute text-[12px] text-blue-300 opacity-0 group-hover:opacity-100 group-hover:animate-[sparkBR_1s_linear_infinite]">•</span>

</div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 text-center flex flex-col min-h-[300px]">
            <h3 className="text-xl font-bold text-slate-900 font-['Chivo']">
              {leader.name}
            </h3>

            <p className="text-sm font-semibold text-[#0A66C2] mt-2 mb-3 uppercase tracking-wide">
              {leader.role}
            </p>

            <div className="relative mb-4">
              <p className="text-sm text-slate-600 leading-6 max-h-[70px] overflow-hidden group-hover:max-h-[200px] transition-all duration-400">
                {leader.bio}
              </p>
            </div>

            <div className="mb-5">
              <div className="flex justify-center gap-1.5 flex-wrap">
                {leader.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs whitespace-nowrap px-1 py-1 rounded-full border border-[#0A66C2]/10 bg-[#0A66C2]/5 text-[#0A66C2]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300">
  <a
    href={leader.linkedin}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300"
  >
    <Linkedin size={16} />
  </a>

  <a
    href={`mailto:${leader.email}`}
    className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300"
  >
    <Mail size={16} />
  </a>
</div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

          {/* Facilities */}
          <div className="mb-20" ref={facilRef}>
            <div className="text-center mb-10 reveal">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider">
                Infrastructure
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2 font-['Chivo']">
                Our Facilities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {[
                {
                  title: "14000 sqft Operating Space",
                  desc: "Large, well-organized workspace for heavy fabrication work.",
                },
                {
                  title: "5 Ton EOT Crane",
                  desc: "Heavy lifting capability for large fabrication assemblies.",
                },
                {
                  title: "Welding Machines",
                  desc: "GTAW, GMAW, MMAW welding machines for all types of welding requirements.",
                },
                {
                  title: "Advanced Laser Technology",
                  desc: "State-of-the-art laser cutting and welding equipment.",
                },
                {
                  title: "CNC & Manual Machines",
                  desc: "Conventional milling, turning, and radial drilling machines.",
                },
                {
                  title: "Quality Inspection",
                  desc: "Dedicated quality inspectors ensuring every product meets standards.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="reveal flex gap-4 p-5 border border-slate-200 rounded-md bg-white hover:border-[#0A66C2] transition-colors"
                >
                  <CheckCircle
                    size={20}
                    className="text-[#0A66C2] shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#0A66C2] rounded-md p-6 sm:p-8 md:p-10 text-center reveal">
            <h2 className="text-3xl font-bold text-white mb-4 font-['Chivo']">
              Ready to Work With Our Team?
            </h2>
            <p className="text-blue-100 mb-6 max-w-lg mx-auto">
              Contact our experienced team today and let us help you with your
              next fabrication project.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#0A66C2] px-7 py-3 rounded-sm font-semibold hover:bg-blue-50 transition-colors"
              data-testid="about-contact-btn"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}