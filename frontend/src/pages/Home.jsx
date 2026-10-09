import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronRight,
  ChevronLeft,
  Award,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Instagram,
  Globe,
  Star,
} from "lucide-react";
import { useReveal } from "../hooks/useReveal";
import InquireModal from "../components/InquireModal";
import { SERVICES as ALL_SERVICES } from "./Services";
import { fetchPublishedProjects } from "../utils/projectsApi";

// Hero
import hero1 from "../assets/images/hero1.jpg";
import hero2 from "../assets/images/hero2.jpg";
import hero3 from "../assets/images/hero3.jpg";

// About / Factory / Infra
import aboutFactory from "../assets/images/about-factory.jpg";
import factory1 from "../assets/images/factory1.jpg";
import factory2 from "../assets/images/factory2.jpg";
import factory3 from "../assets/images/factory3.jpg";
import factory4 from "../assets/images/factory4.jpg";
import infra1 from "../assets/images/infra1.jpg";
import infra2 from "../assets/images/infra2.jpg";
import infra3 from "../assets/images/infra3.jpg";

// Video thumbnails
import video1 from "../assets/images/video1.jpg";
import video2 from "../assets/images/video2.jpg";
import video3 from "../assets/images/video3.jpg";

// We Serve images
import aerospaceProject from "../assets/images/serve/aerospace-project.jpg";
import defenceProject from "../assets/images/serve/defence-project.jpg";
import pharmaProject from "../assets/images/serve/pharma-project.jpg";
import semiProject from "../assets/images/serve/semi-project.jpg";
import foodProject from "../assets/images/serve/food-project.jpg";
import energyProject from "../assets/images/serve/energy-project.jpg";

// Client logos
import abb from "../assets/images/clients/abb.png";
import bel from "../assets/images/clients/bel.png";
import boeing from "../assets/images/clients/boeing.png";
import hp from "../assets/images/clients/hp.png";
import hydrotherm from "../assets/images/clients/hydrotherm.png";
import hydac from "../assets/images/clients/hydac.png";
import kennametal from "../assets/images/clients/kennametal.png";
import leeboy from "../assets/images/clients/leeboy.png";
import triveni from "../assets/images/clients/triveni.png";


const HERO_SLIDES = [
  {
    img: hero1,
    tag: "ISO 9001:2015 · ZED Certified",
    heading: "Precision Welding & Machining Solution Partner",
    text: "End-to-end stainless steel fabrication with world-class quality standards. Serving energy, pharma, automotive and aerospace sectors.",
    cta1: { label: "Inquire Now", action: "modal" },
    cta2: { label: "Our Capabilities", to: "/capabilities" },
  },
  {
    img: hero2,
    tag: "ISO 9001:2015 · ADNOC Approved Vendor",
    heading: "Driving Quality Culture in Meeting the Global Standards",
    text: "Skilled welders qualified for 6G positions handling GTAW, GMAW, MMAW, Laser and Orbital welding for the world's most demanding applications.",
    cta1: { label: "Inquire Now", action: "modal" },
    cta2: { label: "Quality & Certifications", to: "/quality" },
  },
  {
    img: hero3,
    tag: "Open for Global Projects",
    heading: "Winning with Customers in the Journey of Excellence",
    text: "From pressure vessels to precision assemblies — we manufacture to your exact specifications with guaranteed quality and on-time delivery.",
    cta1: { label: "Inquire Now", action: "modal" },
    cta2: { label: "View Projects", to: "/projects" },
  },
];

const WHYCHOOSE = [
  {
    icon: <Award size={30} />,
    title: "Quality First",
    desc: "ISO 9001:2015 certified processes ensuring consistent high-quality output every time.",
  },
  {
    icon: <Users size={30} />,
    title: "Skilled Workforce",
    desc: "Welders qualified for 6G positions with experienced project engineers on every job.",
  },
  {
    icon: <Clock size={30} />,
    title: "Timely Delivery",
    desc: "We communicate status to stakeholders and meet every delivery timeline, guaranteed.",
  },
  {
    icon: <CheckCircle size={30} />,
    title: "Deep Experience",
    desc: "Serving energy, pharma, aerospace, automotive and food industries since 2018.",
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Technical Planning & Design",
    desc: "We lay out the plan and conceptualize the required design for your product.",
  },
  {
    num: "02",
    title: "Sourcing & Procurement",
    desc: "Strong committed vendor base for project-specific procurement and sourcing.",
  },
  {
    num: "03",
    title: "Fabricate, QA & Testing",
    desc: "Highly skilled engineering workmanship deployed with assured quality control.",
  },
  {
    num: "04",
    title: "Delivery / Installation",
    desc: "We communicate status and ensure delivery timelines are met and deployed.",
  },
];

const STATS = [
  { value: "100%", label: "Quality Adherence" },
  { value: "200+", label: "Successful Projects" },
  { value: "50+", label: "Customers" },
  { value: "8+", label: "Industry Sectors" },
];

const WE_SERVE_ITEMS = [
  {
    title: "Energy Sector",
    text: "We have executed a high-pressure welded pipeline for a steam turbine with 100% radiographic joints welded at the 6G position – meeting the most critical energy sector standards.",
    image: aerospaceProject,
  },
  {
    title: "Pharmaceuticals",
    text: "We have developed welded stainless steel drug processing equipment and containers qualifying the strict requirements of medical standards for pharmaceutical manufacturing.",
    image: defenceProject,
  },
  {
    title: "Locomotive",
    text: "We have fabricated train seating and coaches, meeting the stringent locomotive safety standards. Precision fabrication for passenger comfort and safety.",
    image: pharmaProject,
  },
  {
    title: "Aeronautical",
    text: "We have developed machined aluminum components for aerospace-grade standards, requiring extremely tight tolerances and advanced machining capabilities.",
    image: semiProject,
  },
  {
    title: "Food Industries",
    text: "We have manufactured welded food-grade stainless steel processing equipment and storage containers qualifying food safety standards.",
    image: foodProject,
  },
  {
    title: "Automotive Industries",
    text: "We have developed a precision fixture for an automotive seating assembly line component welding to enable mass production, improved productivity and consistent quality.",
    image: energyProject,
  },
];

const CLIENT_LOGOS = [
  { src: abb, alt: "ABB" },
  { src: bel, alt: "Bharat Electronics" },
  { src: boeing, alt: "Boeing" },
  { src: hp, alt: "HP" },
  { src: hydrotherm, alt: "Hydrotherm" },
  { src: hydac, alt: "Hydac" },
  { src: kennametal, alt: "Kennametal" },
  { src: leeboy, alt: "LeeBoy" },
  { src: triveni, alt: "Triveni Turbines" },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Kumar",
    role: "Procurement Manager",
    company: "Pharma Corp India",
    sector: "Pharmaceuticals",
    rating: 4,
    text: "DFAB delivered our pressure vessels exactly to spec, on time and within budget. Their welding quality passed all our strict pharmaceutical standards without a single rework. Highly recommend for any critical fabrication work.",
  },
  {
    name: "Suresh Nair",
    role: "Project Director",
    company: "Power Gen Systems",
    sector: "Energy",
    rating: 5,
    text: "We hired DFAB for a high-pressure steam pipeline project requiring 100% radiographic testing. Their 6G welders delivered impeccable results. Zero defects, zero delays. This is the team you want for critical energy infrastructure.",
  },
  {
    name: "Anand Krishnamurthy",
    role: "VP Operations",
    company: "DairyCo Foods",
    sector: "Food & Dairy",
    rating: 4,
    text: "DFAB fabricated our stainless steel food processing tanks to FSSAI standards. The finish quality and hygiene compliance were top-notch. Their team was professional and responsive throughout the project.",
  },
  {
    name: "Priya Mehta",
    role: "Engineering Head",
    company: "AutoTech Manufacturing",
    sector: "Automotive",
    rating: 4,
    text: "The jig and fixture system DFAB built for our assembly line improved our production efficiency by 30%. Excellent precision, great team coordination, and they genuinely understood our manufacturing requirements.",
  },
  {
    name: "Vikram Sharma",
    role: "Technical Manager",
    company: "AeroSpace Components Ltd",
    sector: "Aeronautical",
    rating: 5,
    text: "DFAB's precision machining capabilities met our aerospace-grade tolerance requirements. The quality inspection process they follow is thorough and their documentation was complete and professional.",
  },
  {
  name: "Raghavi Kodati",
  role: "Manager",
  company: "IIT Chemical Engineering",
  sector: "Chemical",
  rating: 5,
  text: "As a deep tech startup developing novel electrolysers, DFAB stood out as an exceptional machining partner. Pramod's deep process expertise helped us refine our designs, accurately estimate machining times and costs, and deliver on time with quality. Beyond standard machining, DFAB proactively engaged in prototyping novel welding processes with us — working out the fixtures and process parameters needed to make it happen.",
},
];

function SectionHeading({ eyebrow, title, text, light = false }) {
  return (
    <div className="text-center mb-12 md:mb-14 reveal">
      <span
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${
          light ? "text-blue-200" : "text-[#0A66C2]"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-3 text-3xl md:text-4xl lg:text-5xl font-bold font-['Chivo'] tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-4 max-w-2xl mx-auto text-sm md:text-base leading-7 ${
            light ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
      ))}
    </div>
  );
}

function HeroCarousel({ onInquire }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
    containScroll: "trimSnaps",
  });
  const [current, setCurrent] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());

    onSelect();
    emblaApi.on("select", onSelect);

    const timer = setInterval(() => {
      emblaApi?.scrollNext();
    }, 5500);

    return () => {
      clearInterval(timer);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative w-full h-[560px] md:h-[680px] overflow-hidden" data-testid="hero-carousel">
      <div className="embla w-full h-full overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={i}
              className="embla__slide relative h-full w-full min-w-0 flex-[0_0_100%]"
              data-testid={`hero-slide-${i + 1}`}
            >
              <img
                src={slide.img}
                alt={slide.heading}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(10,102,194,0.24),transparent_32%)]" />

              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                  <div className="max-w-2xl">
                    <span className="inline-block bg-[#0A66C2] text-white text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-sm mb-5 shadow-lg">
                      {slide.tag}
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 font-['Chivo']">
                      {slide.heading}
                    </h1>

                    <p className="text-base md:text-lg text-white/85 mb-8 leading-relaxed">
                      {slide.text}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      {slide.cta1.action === "modal" ? (
                        <button
                          onClick={onInquire}
                          className="bg-[#0A66C2] text-white px-7 py-3 font-semibold rounded-sm hover:bg-[#084e96] transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                          data-testid={`hero-cta-primary-${i}`}
                        >
                          {slide.cta1.label}
                        </button>
                      ) : (
                        <Link
                          to={slide.cta1.to}
                          className="bg-[#0A66C2] text-white px-7 py-3 font-semibold rounded-sm hover:bg-[#084e96] transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                          data-testid={`hero-cta-primary-${i}`}
                        >
                          {slide.cta1.label}
                        </Link>
                      )}

                      <Link
                        to={slide.cta2.to}
                        className="border border-white/80 text-white px-7 py-3 font-semibold rounded-sm hover:bg-white hover:text-slate-900 transition-all duration-300 hover:-translate-y-0.5"
                        data-testid={`hero-cta-secondary-${i}`}
                      >
                        {slide.cta2.label}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-105"
        data-testid="hero-prev"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/15 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-105"
        data-testid="hero-next"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-[#0A66C2]" : "w-2 bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function WeServeSection() {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const frameRef = useRef(null);

  const cardWidth = 320;
  const gap = 32;
  const total = cardWidth + gap;

  const speed = 3;
  const holdTime = 2000;

  const items = [...WE_SERVE_ITEMS, ...WE_SERVE_ITEMS, ...WE_SERVE_ITEMS];
  const baseIndex = WE_SERVE_ITEMS.length;

  const [activeIndex, setActiveIndex] = useState(null);

  const offsetRef = useRef(baseIndex * total);
  const activeIndexRef = useRef(baseIndex);
  const pauseUntilRef = useRef(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const animate = (time) => {
      if (!trackRef.current || !wrapperRef.current) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const wrapperWidth = wrapperRef.current.offsetWidth;
      const screenCenter = wrapperWidth / 2;

      const centerX = offsetRef.current + screenCenter;
      const nearestIndex = Math.round((centerX - cardWidth / 2) / total);
      const nearestCenter = nearestIndex * total + cardWidth / 2;
      const distance = Math.abs(nearestCenter - centerX);

      if (
        !isPausedRef.current &&
        distance <= speed &&
        nearestIndex !== activeIndexRef.current
      ) {
        activeIndexRef.current = nearestIndex;
        setActiveIndex(nearestIndex);
        isPausedRef.current = true;
        pauseUntilRef.current = time + holdTime;
        offsetRef.current = nearestIndex * total + cardWidth / 2 - screenCenter;
      }

      if (isPausedRef.current) {
        if (time >= pauseUntilRef.current) {
          setActiveIndex(null);
          isPausedRef.current = false;
        }
      } else {
        offsetRef.current += speed;

        const resetPoint = WE_SERVE_ITEMS.length * total * 2;
        const resetTo = WE_SERVE_ITEMS.length * total;
        if (offsetRef.current >= resetPoint) {
          offsetRef.current = resetTo;
        }
      }

      trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [total, cardWidth]);

  const move = (dir) => {
    if (!wrapperRef.current) return;
    const nextIndex = activeIndexRef.current + dir;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    isPausedRef.current = true;
    pauseUntilRef.current = performance.now() + holdTime;

    const wrapperWidth = wrapperRef.current.offsetWidth;
    offsetRef.current = nextIndex * total + cardWidth / 2 - wrapperWidth / 2;
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="We Serve"
          title="Industries We Serve"
          text="Precision fabrication solutions across critical industries."
        />

        <div ref={wrapperRef} className="relative py-10">
          <button
            onClick={() => move(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-200 shadow-xl rounded-full p-4 hover:bg-blue-50 text-[#0A66C2] transition-all"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => move(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-slate-200 shadow-xl rounded-full p-4 hover:bg-blue-50 text-[#0A66C2] transition-all"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={trackRef}
            className="flex items-center"
            style={{
              gap: `${gap}px`,
              width: "max-content",
              willChange: "transform",
            }}
          >
            {items.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <div
                  key={`${item.title}-${index}`}
                  className={`group shrink-0 rounded-3xl overflow-hidden bg-white border transition-all duration-700 ease-in-out ${
                    isActive
                      ? "scale-110 shadow-2xl border-[#0A66C2] z-30"
                      : "scale-90 shadow-sm border-slate-100 opacity-30"
                  }`}
                  style={{ width: `${cardWidth}px` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`w-full h-full object-cover transition-transform duration-1000 ${
                        isActive ? "scale-110" : "scale-100"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl md:text-2xl font-bold text-white font-['Chivo']">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 text-center bg-white">
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ClientLogosSection() {
  const logos = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

  return (
    <section
      className="py-16 md:py-20 bg-white overflow-hidden"
      data-testid="client-logos-section"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 reveal">
          <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.18em]">
            Trusted By
          </span>
          <h3 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 font-['Chivo'] tracking-tight">
            Leading Companies
          </h3>
        </div>
        <br />
        <br />
        <br />

        <div className="overflow-hidden relative">
          <div className="flex items-center gap-16 md:gap-20 w-max animate-[logoScroll_28s_linear_infinite]">
            {logos.map((logo, i) => (
              <div
                key={i}
                className="flex items-center justify-center min-w-[180px] md:min-w-[220px]"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 md:h-20 object-contain mx-auto transition-all duration-300 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes logoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: false });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()));
    const timer = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <section className="py-16 md:py-24 bg-[#0A66C2] overflow-hidden" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SectionHeading
          eyebrow="Client Feedback"
          title="What Our Clients Say"
          text="Real feedback from customers across critical industrial sectors."
          light
        />

        <div className="embla overflow-hidden" ref={emblaRef} data-testid="testimonials-carousel">
          <div className="embla__container">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="embla__slide"
                style={{ flex: "0 0 100%", minWidth: 0, paddingLeft: "1rem", paddingRight: "1rem" }}
                data-testid={`testimonial-slide-${i}`}
              >
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 text-[140px] font-black text-blue-50 leading-none select-none font-['Chivo']">
                      "
                    </div>

                    <div className="relative z-10">
                      <StarRating count={t.rating} />
                      <p className="text-slate-700 text-lg leading-relaxed mt-5 mb-7 italic font-medium">
                        "{t.text}"
                      </p>

                      <div className="flex items-center gap-4 pt-5 border-t border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-blue-400 flex items-center justify-center text-white font-bold text-xl font-['Chivo'] shrink-0">
                          {t.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 font-['Chivo']">{t.name}</div>
                          <div className="text-sm text-slate-500">
                            {t.role} · {t.company}
                          </div>
                        </div>
                        <span className="text-xs bg-blue-50 text-[#0A66C2] font-semibold px-3 py-1.5 rounded-full">
                          {t.sector}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 mt-8">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            data-testid="testimonial-prev"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
                data-testid={`testimonial-dot-${i}`}
              />
            ))}
          </div>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
            data-testid="testimonial-next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [showInquire, setShowInquire] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredProjectsLoading, setFeaturedProjectsLoading] = useState(true);
  const aboutRef = useReveal();
  const servicesRef = useReveal();
  const whyRef = useReveal();
  const processRef = useReveal();
  const projectsRef = useReveal();
  const infraRef = useReveal();
  const instaRef = useReveal();
  const ctaRef = useReveal();

  useEffect(() => {
    let cancelled = false;
    let retryTimer;

    const loadProjects = async (retryOnFailure = true) => {
      try {
        const allProjects = await fetchPublishedProjects({ timeoutMs: 35000 });
        if (cancelled) return;

        const featured = allProjects.filter((project) => project.featured).slice(0, 3);
        const remaining = allProjects
          .filter((project) => !featured.some((item) => String(item.id) === String(project.id)))
          .slice(0, Math.max(0, 3 - featured.length));

        // Homepage cards come only from MongoDB. Featured projects are first;
        // other published database projects fill any remaining of the 3 slots.
        setFeaturedProjects([...featured, ...remaining].slice(0, 3));
        setFeaturedProjectsLoading(false);
      } catch (error) {
        console.error("Failed to fetch featured projects:", error);
        if (retryOnFailure && !cancelled) {
          retryTimer = window.setTimeout(() => {
            retryTimer = undefined;
            loadProjects(false);
          }, 2500);
          return;
        }

        if (!cancelled) {
          setFeaturedProjects([]);
          setFeaturedProjectsLoading(false);
        }
      }
    };

    loadProjects();

    const handleFocus = () => loadProjects(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("dfab:projects-updated", handleFocus);

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("dfab:projects-updated", handleFocus);
    };
  }, []);

  return (
    <main className="bg-white">
      <HeroCarousel onInquire={() => setShowInquire(true)} />

      <div className="bg-[#0A66C2]" data-testid="stats-bar">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center text-white reveal delay-${(i + 1) * 100}`}
              >
                <div className="text-3xl font-bold font-['Chivo']">{s.value}</div>
                <div className="text-sm text-blue-100 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section
        className="py-16 md:py-24 bg-white"
        data-testid="about-preview"
        ref={aboutRef}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-stretch">
            {/* LEFT CONTENT */}
            <div className="reveal-left md:col-span-5 flex flex-col justify-center">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.18em]">
                About DFAB
              </span>

              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3 mb-5 font-['Chivo'] tracking-tight">
                Fabricating Your Vision with Precision
              </h2>

              <p className="text-slate-600 leading-7 mb-5">
                DFAB Stainless System Pvt Ltd is an{" "}
                <strong>ISO 9001:2015 certified</strong> fabrication company
                established in 2018, located in the prime Peenya Industrial Area,
                Bengaluru.
              </p>

              <p className="text-slate-600 leading-7 mb-8">
                With a 14000 sq-ft facility, a 5-ton crane,(GTAW, GMAW, MMAW) are Processed, and a highly skilled team, we provide end-to-end solutions in
                equipment fabrication, high-pressure pipeline welding, and precision
                machining.
              </p>

              {/* FEATURES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                  "14000 sqft Operating Space",
                  "5 Ton Crane Facility",
                  "GTAW/GMAW/MMAW Welding Machines",
                  "Skilled 6G Welders",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                  >
                    <CheckCircle size={16} className="text-[#0A66C2] shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* BUTTON */}
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-6 py-3 rounded-sm font-semibold hover:bg-[#084e96] transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 w-fit"
              >
                Learn More <ArrowRight size={16} />
              </Link>
            </div>

            {/* RIGHT IMAGE */}
            <div className="md:col-span-7 relative">
              {/* IMAGE (UNCHANGED RATIO) */}
              <img
                src={aboutFactory}
                alt="DFAB Factory"
                className="rounded-2xl w-full h-full object-cover shadow-3xl"
              />

              {/* 8+ BADGE (OUTSIDE LEFT BOTTOM) */}
              <div className="absolute bottom-3 left-3 sm:bottom-3 sm:left-3 md:bottom-3 md:left-3 z-10 ...">
                <div className="rounded-xl bg-[#0A66C2]/90 backdrop-blur-md text-white px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.25)] border border-white/20">
                  <div className="text-2xl sm:text-3xl font-bold font-['Chivo'] leading-none">
                    8+
                  </div>

                  <div className="text-[10px] sm:text-xs text-blue-100 mt-1 tracking-wide">
                    Years of Excellence
                  </div>
                </div>
              </div>

              {/* SOFT SHADOW BEHIND BADGE */}
              <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6 w-28 h-28 bg-black/20 blur-2xl rounded-full -z-0" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-slate-50" data-testid="services-section" ref={servicesRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHeading
            eyebrow="What We Do"
            title="Our Services"
            text="High-quality fabrication solutions for industrial applications."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_SERVICES.slice(0, 3).map((s) => (
              <div
                key={s.title}
                className="reveal group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-2 hover:shadow-xl hover:border-[#0A66C2]/30 transition-all duration-500"
                data-testid={`service-card-${s.title.replace(/\s/g, "-").toLowerCase()}`}
              >
                <div className="overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 font-['Chivo']">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-6 line-clamp-3">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 reveal">
            <Link
  to="/projects#services"
  className="inline-flex items-center gap-2 border border-[#0A66C2] text-[#0A66C2] px-6 py-3 rounded-sm font-semibold hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5"
  data-testid="services-view-all"
>
  View All Services <ArrowRight size={16} />
</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white" data-testid="why-choose-section" ref={whyRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHeading
            eyebrow="Why DFAB"
            title="Why Choose Us"
            text="Reliable processes, skilled workmanship and delivery confidence for every project."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {WHYCHOOSE.map((item) => (
              <div
                key={item.title}
                className="reveal text-center bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#0A66C2]/30 transition-all duration-500"
                data-testid={`why-card-${item.title.replace(/\s/g, "-").toLowerCase()}`}
              >
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-[#0A66C2] mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 font-['Chivo']">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#0F172A]" data-testid="process-section" ref={processRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHeading
            eyebrow="How We Work"
            title="Our Work Process"
            text="A structured approach from design to delivery."
            light
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {PROCESS.map((step, i) => (
              <div key={step.num} className="relative reveal" data-testid={`process-step-${step.num}`}>
                <div className="bg-slate-800/95 rounded-2xl p-6 h-full border border-slate-700 hover:border-[#0A66C2] hover:-translate-y-2 hover:shadow-2xl transition-all duration-500">
                  <div className="text-5xl font-black text-[#0A66C2]/30 font-['Chivo'] mb-3">
                    {step.num}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 font-['Chivo']">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-6">{step.desc}</p>
                </div>

                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:flex absolute top-8 -right-3 z-10 w-6 h-6 bg-[#0A66C2] rounded-full items-center justify-center shadow-lg">
                    <ChevronRight size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <WeServeSection />

      {/* --- Featured Projects Section --- */}
      <section
        className="py-16 md:py-24 bg-slate-50"
        data-testid="projects-preview"
        ref={projectsRef}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHeading
            eyebrow="Our Portfolio"
            title="Featured Projects"
            text="Delivering precision fabrication across diverse industrial sectors."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {featuredProjectsLoading
              ? [...Array(3)].map((_, index) => (
                  <div
                    key={`featured-project-loading-${index}`}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[360px] animate-pulse"
                    aria-hidden="true"
                  >
                    <div className="aspect-[16/10] bg-slate-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-5/6" />
                    </div>
                  </div>
                ))
              : featuredProjects.map((p) => (
              <div
                key={p.id}
                className="reveal group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full transition-all duration-700 hover:border-[#0A66C2]/30 hover:shadow-xl [transform-style:preserve-3d] hover:[transform:perspective(1200px)_rotateY(6deg)_rotateX(3deg)_translateY(-10px)_scale(1.02)]"
                data-testid={`project-card-${String(p.title).replace(/\s/g, "-").toLowerCase()}`}
              >
                {/* 1. FIXED IMAGE BOX (Aspect Ratio) */}
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-slate-100">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {p.tag && (
                    <span className="absolute top-4 left-4 bg-[#0A66C2] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10">
                      {p.tag}
                    </span>
                  )}
                </div>

                {/* 2. FLEX-GROW CONTENT */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 font-['Chivo']">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-6 line-clamp-3">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 reveal">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 border border-[#0A66C2] text-[#0A66C2] px-8 py-3 rounded-sm font-semibold hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5"
            >
              View All Projects <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Infrastructure Section --- */}
      <section
        className="py-16 md:py-24 bg-white"
        data-testid="infrastructure-preview"
        ref={infraRef}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT: Strict fixed-ratio image grid */}
            <div className="reveal-left flex flex-col gap-4">
              {/* Row 1: Two equal 1:1 squares side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 relative"
                  style={{ aspectRatio: "1/1" }}
                >
                  <img
                    src={infra1}
                    alt="Factory floor"
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 relative"
                  style={{ aspectRatio: "1/1" }}
                >
                  <img
                    src={infra2}
                    alt="Machinery"
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Row 2: Full-width 16:7 cinematic banner */}
              <div
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 relative w-full"
                style={{ aspectRatio: "16/7" }}
              >
                <img
                  src={infra3}
                  alt="Welding operation"
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* RIGHT: Content */}
            <div className="reveal-right">
              <span className="text-xs font-semibold text-[#0A66C2] uppercase tracking-[0.2em]">
                Our Facility
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3 mb-6 font-['Chivo'] tracking-tight">
                World-Class Infrastructure
              </h2>
              <p className="text-slate-600 leading-7 mb-8 text-lg">
                Our 14000 sq-ft state-of-the-art facility in Peenya Industrial Area is equipped with advanced machinery and operated by a highly skilled engineering team.
              </p>

              <div className="space-y-3 mb-10">
                {[
                  "14000 sqft Operating Space with 5 Ton Crane",
                  "GTAW, GMAW, MMAW are processed",
                  "Conventional Milling & Turning Machines",
                  "Radial Drilling Machine",
                  "Advanced Laser Technology",
                  "Quality Inspection Equipment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl px-5 py-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#0A66C2] shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/infrastructure"
                className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-10 py-4 rounded-sm font-bold hover:bg-[#084e96] transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
              >
                Explore Infrastructure <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <ClientLogosSection />

      <section className="py-10 bg-[#0A66C2]" data-testid="export-banner">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 reveal">
            <div className="flex items-center gap-4 text-white">
              <Globe size={36} className="shrink-0 text-white/70" />
              <div>
                <p className="text-xl font-bold font-['Chivo']">Open for Global Projects</p>
                <p className="text-blue-200 text-sm">Engineering Excellence from India</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex gap-3 flex-wrap justify-center">
                {["ISO 9001:2015", "ZED Certified", "ADNOC Approved"].map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-bold bg-white/15 text-white border border-white/30 px-3 py-1.5 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <Link
                to="/quality"
                className="bg-white text-[#0A66C2] px-6 py-2.5 rounded-sm font-semibold text-sm hover:bg-blue-50 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
              >
                View Certifications
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showInquire && <InquireModal onClose={() => setShowInquire(false)} />}
    </main>
  );
}