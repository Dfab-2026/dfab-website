import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollScrubVideo from "../components/ScrollScrubVideo";



import sheetmetalImg from "../assets/images/services/sheetmetal.jpg";
import pressureVesselsImg from "../assets/images/services/pressure-vessels.jpg";
import pipelineFabricationImg from "../assets/images/services/pipeline-fabrication.jpg";
import stelliteWeldingImg from "../assets/images/services/stellite-welding.jpg";
import dieWeldingImg from "../assets/images/services/die-welding.jpg";
import customFabricationImg from "../assets/images/services/custom-fabrication.jpg";
import jigFixtureImg from "../assets/images/services/jig-fixture.jpg";
import precisionMachiningImg from "../assets/images/services/precision-machining.jpg";
import newProductDevelopmentImg from "../assets/images/services/new-product-development.jpg";
// Added the 3 new image imports below:
import weldingEngineeringImg from "../assets/images/services/welding-engineering.jpg";
import d2mImg from "../assets/images/services/d2m.jpg";
import prototypeDevelopmentImg from "../assets/images/services/prototype-development.jpg";

export const SERVICES = [
  {
    image: sheetmetalImg,
    title: "Sheetmetal Fabrication",
    subtitle: "SS, Aluminum & CS · GTAW, GMAW, Arc Welding",
    desc: "We develop sheet metal components and complex systems by fabrication. Our skilled team handles stainless steel, aluminum, and carbon steel with TIG, MIG, and Arc welding techniques to deliver precise, high-quality components.",
    sectors: ["Energy", "Automotive", "Architecture"],
  },
  {
    image: pressureVesselsImg,
    title: "CDU Manifold and Piping Assemblies",
    subtitle: "Pharma · Dairy · Industrial",
    desc: "We provide high-quality CDU Manifold and Piping Assemblies designed for efficient fluid distribution and cooling performance. Built with premium stainless steel, our systems ensure durability and seamless integration.",
    sectors: ["Pharmaceuticals", "Food & Dairy", "Chemical"],
  },
  {
    image: pipelineFabricationImg,
    title: "Pipeline Fabrication",
    subtitle: "Oil & Gas · Pharma · Dairy",
    desc: "We fabricate pressure pipelines and erect them on respective systems onsite/offsite. Capable of 100% radiographic welding joints at 6G positions for the highest quality pipeline systems.",
    sectors: ["Oil & Gas", "Pharmaceuticals", "Energy"],
  },
  {
    image: stelliteWeldingImg,
    title: "Stellite Welding",
    subtitle: "Erosion & Corrosion Resistance",
    desc: "We are experts in welding stellite — the hardest material disposition — to achieve superior resistance to erosion and corrosion on critical components that face harsh operating conditions.",
    sectors: ["Oil & Gas", "Power", "Aerospace"],
  },
  {
    image: dieWeldingImg,
    title: "Die Welding",
    subtitle: "Die Refurbishment & Life Extension",
    desc: "We specialize in refurbishing die life by depositing parent material in the worn-out regions of dies. After machining, the die returns to production with extended life and consistent quality output.",
    sectors: ["Automotive", "Manufacturing", "Tooling"],
  },
  {
    image: customFabricationImg,
    title: "Custom Fabrication & Architecture",
    subtitle: "Décor · Structures · Custom Systems",
    desc: "We fabricate custom architectural décor products and structures with high-quality style and finish. From residential installations to commercial architectural elements in stainless steel.",
    sectors: ["Architecture", "Interior Design", "Commercial"],
  },
  {
    image: jigFixtureImg,
    title: "Jig & Fixture Development",
    subtitle: "Precision Tooling for Production",
    desc: "We develop precision jigs and fixtures for your production requirements, enabling faster turnaround time and consistent quality throughout your production run.",
    sectors: ["Automotive", "Aerospace", "Manufacturing"],
  },
  {
    image: precisionMachiningImg,
    title: "Precision Machining",
    subtitle: "CNC & Conventional Machining",
    desc: "We have the capability of producing highly precise machined components required for the fabrication needs of complex systems. Milling, turning, drilling to tight tolerances.",
    sectors: ["Aerospace", "Automotive", "Defense"],
  },
  {
    image: newProductDevelopmentImg,
    title: "New Product Development",
    subtitle: "NPD · Engineering · Prototyping",
    desc: "We specialize in comprehensive new product development (NPD) services designed to turn your vision into a successful reality. From concept to prototype to production.",
    sectors: ["Startups", "R&D", "Manufacturing"],
  },
  {
    image: weldingEngineeringImg, // Updated
    title: "Welding Engineering Services",
    subtitle: "WPS / PQR Development",
    desc: "We provide services including development of Welding Procedure Specifications (WPS) and Procedure Qualification Records (PQR) to ensure compliance with industry standards and high-quality weld performance.",
    sectors: ["Oil & Gas", "Manufacturing", "Heavy Engineering"],
  },
  {
    image: d2mImg, // Updated
    title: "Design to Manufacturing (D2M)",
    subtitle: "3D Design · Optimization · Cost Reduction",
    desc: "We transform concepts into manufacturable products through 3D design, engineering optimization, and cost reduction strategies. Our D2M approach ensures efficiency, scalability, and production readiness.",
    sectors: ["Product Development", "R&D", "Manufacturing"],
  },
  {
    image: prototypeDevelopmentImg, // Updated
    title: "Prototype Development Services",
    subtitle: "1–50 Quantity Builds · Rapid Fabrication",
    desc: "We offer rapid prototype development services from 1 to 50 quantity builds. Our fast fabrication process helps validate designs quickly and accelerates time-to-market.",
    sectors: ["Startups", "Innovation", "Product Testing"],
  },
];

export default function Services() {
  return (
    <main className="bg-white">
      <ScrollScrubVideo fallbackImage={sheetmetalImg} playbackSpeed={1.65} />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-14">
            <p className="text-slate-600 max-w-2xl mx-auto">
              From precision machining to complete fabrication systems, DFAB provides comprehensive industrial solutions for all sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="bg-white border border-slate-200 rounded-md overflow-hidden hover:border-[#0A66C2] hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                data-testid={`service-detail-${s.title.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-56 object-cover"
                />

                <div className="p-7">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 font-['Chivo']">
                    {s.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wide mb-3">
                    {s.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {s.desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {s.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-slate-50 border border-slate-200 rounded-md p-6 sm:p-8 md:p-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 font-['Chivo']">
              Need a Custom Solution?
            </h2>
            <p className="text-slate-600 mb-6">
              Tell us your requirements and we'll provide a tailored quote.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-7 py-3 rounded-sm font-semibold hover:bg-[#084e96] transition-colors"
              data-testid="services-contact-btn"
            >
              Request a Quote <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}