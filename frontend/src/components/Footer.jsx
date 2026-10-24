import { Link } from "react-router-dom";
import { 
  MapPin, 
  Phone, 
  PhoneCall,
  Mail, 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter,
  Clock,
  MessageCircle
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020617] text-slate-300 pt-20 pb-10 overflow-hidden border-t border-slate-800/50 font-['Inter',_sans-serif]">
      <style>
        {`
          /* 1. Background Grid */
          .blueprint-grid {
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(rgba(10, 102, 194, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(10, 102, 194, 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
            z-index: 0;
            animation: grid-pulse 8s ease-in-out infinite alternate;
          }
          @keyframes grid-pulse {
            0% { opacity: 0.3; transform: scale(1); }
            100% { opacity: 0.8; transform: scale(1.02); }
          }
          
          .grid-mask {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 100%, transparent 0%, #020617 80%);
            z-index: 1;
            pointer-events: none;
          }

          /* 2. Plasma Cutter Top Border Animation */
          .plasma-track {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: rgba(255,255,255,0.05);
            z-index: 10;
            overflow: hidden;
          }
          .plasma-head {
            position: absolute;
            top: 0;
            width: 150px;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(10,102,194,0.8), #ffffff);
            box-shadow: 0 0 15px 3px #0A66C2, 0 0 30px 8px #0A66C2;
            animation: plasma-cut 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          @keyframes plasma-cut {
            0% { left: -150px; opacity: 0; }
            10% { opacity: 1; }
            40% { left: 40%; }
            50% { left: 40%; box-shadow: 0 0 25px 8px #fff, 0 0 40px 15px #0A66C2; } 
            90% { left: 100%; opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }

          /* 3. AUTOMATIC LOGO SHINE ANIMATION */
          .logo-shine-container {
            position: relative;
            display: inline-block;
            overflow: hidden;
            /* Ensures overlay doesn't bleed out during hover scale */
            border-radius: 4px; 
          }
          
          .logo-shine-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to right, 
              transparent 0%, 
              rgba(255, 255, 255, 0) 20%, 
              rgba(255, 255, 255, 0.7) 50%, 
              rgba(255, 255, 255, 0) 80%, 
              transparent 100%
            );
            background-size: 200% 100%;
            /* Animates automatically every 4 seconds */
            animation: logo-auto-shine 4s infinite; 
            mix-blend-mode: overlay;
            pointer-events: none;
            z-index: 1;
          }
          
          @keyframes logo-auto-shine {
            0% { background-position: -200% 0; }
            30% { background-position: -200% 0; } /* Pause before shine */
            100% { background-position: 200% 0; }
          }

          /* 4. ANIMATED UNDERLINE */
          .animated-underline {
            height: 2px;
            background: #0A66C2;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(10, 102, 194, 0.7);
          }
          
          .animated-underline::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, #60A5FA, #ffffff, #60A5FA, transparent);
            animation: underline-pulse 3s infinite;
          }
          
          @keyframes underline-pulse {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          /* 5. SOCIAL MEDIA BOOM EFFECT */
          .control-btn {
            position: relative;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(10, 102, 194, 0.3);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .control-btn:hover {
            transform: scale(1.25);
            background: #0A66C2;
            color: white;
            border-color: #60A5FA;
            box-shadow: 0 0 20px 5px rgba(10, 102, 194, 0.6), 0 0 40px 10px rgba(10, 102, 194, 0.3);
            z-index: 30;
          }

          /* 6. WELDING SPARKLE HOVER FOR CARDS */
          .welding-sparkle-card {
            position: relative;
            border: 1px solid transparent;
            transition: all 0.3s ease;
          }
          .welding-sparkle-card:hover {
            border-color: rgba(96, 165, 250, 0.5);
            background: rgba(10, 102, 194, 0.1);
          }
          .welding-sparkle-card:hover::before {
            content: '';
            position: absolute;
            inset: -2px;
            border: 2px solid #0A66C2;
            border-radius: 8px;
            animation: lightning-flicker 0.2s infinite;
            pointer-events: none;
          }
          @keyframes lightning-flicker {
            0% { opacity: 0.5; filter: brightness(1); }
            50% { opacity: 1; filter: brightness(2) drop-shadow(0 0 5px #fff); }
            100% { opacity: 0.5; filter: brightness(1); }
          }

          /* 7. Navigation Link Animation */
          .precision-link {
            position: relative;
            display: inline-flex;
            align-items: center;
            transition: all 0.3s ease;
          }
          .precision-link:hover { color: #ffffff; transform: translateX(8px); }
          .precision-arrow { color: #0A66C2; margin-right: 8px; font-weight: bold; }

          /* UI Corner Accents */
          .ui-corners { position: relative; }
          .ui-corners::before { content: ''; position: absolute; top: -5px; left: -5px; width: 10px; height: 10px; border-width: 1px 0 0 1px; border-color: #0A66C2; border-style: solid; opacity: 0.5; }
          .ui-corners::after { content: ''; position: absolute; bottom: -5px; right: -5px; width: 10px; height: 10px; border-width: 0 1px 1px 0; border-color: #0A66C2; border-style: solid; opacity: 0.5; }
        `}
      </style>

      {/* Grid Background Layers */}
      <div className="blueprint-grid"></div>
      <div className="grid-mask"></div>

      {/* Plasma Cutter Top Border */}
      <div className="plasma-track">
        <div className="plasma-head"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
<div className="md:col-span-5 relative ui-corners flex flex-col p-2">
  <div className="mb-6">
    <Link to="/" className="flex items-center gap-4 group w-fit">
      <img
        src="/logo.png"
        alt="DFAB Logo"
        className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
      />

      <div className="h-10 w-px bg-slate-500/40"></div>

      <p className="text-[11px] sm:text-[12px] md:text-[13px] text-slate-300 font-medium uppercase tracking-[0.12em] sm:tracking-[0.18em] leading-snug whitespace-normal sm:whitespace-nowrap">
        Stainless System Pvt Ltd
        <sup className="text-[8px] text-white ml-1">TM</sup>
      </p>
    </Link>
  </div>

  <div className="w-full animated-underline mb-4"></div>

<ul className="text-slate-400 mb-6 pr-4 text-sm pl-4 space-y-2 list-disc">
  <li>Advanced CNC machining for high-precision components</li>
  <li>Heavy structural fabrication for large-scale projects</li>
  <li>Customized engineering solutions for diverse industries</li>
  <li>Focus on quality, accuracy, and timely delivery</li>
  <li>Supporting global industries with reliable performance</li>
  <li>ISO 9001:2015 certified quality management</li>
  <li>Pressure vessel and industrial pipeline fabrication</li>
  <li>Precision welding for stainless steel, aluminium, and carbon steel</li>
</ul>

<div className="flex flex-wrap gap-2 mb-8 pl-1">
  {["ISO 9001:2015", "ZED CERTIFIED", "ADNOC APPROVED"].map((tag) => (
    <span
      key={tag}
      className="px-2.5 py-1 bg-[#020617] border border-slate-700/80 rounded-md text-[9px] font-bold text-slate-300 tracking-widest shadow-inner"
    >
      {tag}
    </span>
  ))}
</div>
  
            
            {/* Social Links */}
            <div className="mt-auto flex flex-nowrap gap-3 pt-2 pl-1">
              {[
                { Icon: Facebook, url: "https://m.facebook.com/dfabsspl/" },
                { Icon: Instagram, url: "https://www.instagram.com/dfabstainlesssystempvtltd_?igsh=MTZucXJ0c2d6YTJoMA==" },
                { Icon: Youtube, url: "https://www.youtube.com/@dfabstainlesssystempvtltd8581" },
                { Icon: Linkedin, url: "https://www.linkedin.com/company/dfab-stainless-system-pvt-ltd/" },
                { Icon: Twitter, url: "https://twitter.com" },
                { Icon: MessageCircle, url: "https://wa.me/919908504466" }
              ].map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-11 h-11 shrink-0 rounded-lg flex items-center justify-center text-slate-400 control-btn outline-none"
                >
                  <item.Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Site Navigation */}
          <div className="md:col-span-3 flex flex-col pt-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 bg-[#0A66C2] mr-3 rounded-sm shadow-[0_0_5px_#0A66C2]"></span>
              Navigation
            </h4>
            <ul className="flex flex-1 flex-col justify-between space-y-4">
              {[
                ["Home", "/"], ["About Us", "/about"], ["Capabilities", "/capabilities"],
                ["Our Projects", "/projects"], ["Infrastructure", "/infrastructure"],
                ["Quality Control", "/quality"], ["Careers", "/careers"], ["Contact Team", "/contact"]
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-sm text-slate-400 precision-link font-medium outline-none">
                    <span className="precision-arrow">❯</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* HQ & Contact */}
          <div className="md:col-span-4 flex flex-col pt-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center">
              <span className="w-2 h-2 bg-[#0A66C2] mr-3 rounded-sm shadow-[0_0_5px_#0A66C2]"></span>
              Global HQ
            </h4>
            <ul className="flex flex-1 flex-col justify-between space-y-3">
              <li className="flex gap-4 items-start welding-sparkle-card p-3 rounded-lg cursor-default">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800/80 text-[#0A66C2] border border-slate-700/50">
                  <MapPin size={18} />
                </div>
                <span className="text-sm text-slate-300 leading-relaxed pt-1">
                  No: 3B/415, No-8 KIADB Main Road, 1st Stage, 2nd Phase, Peenya Industrial Area, Bengaluru – 560058
                </span>
              </li>
              <li className="flex gap-4 items-center welding-sparkle-card p-3 rounded-lg group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800/80 text-[#0A66C2] border border-slate-700/50">
                  <Phone size={18} />
                </div>
                <a href="tel:+919908504466" className="text-sm text-slate-300 font-bold tracking-wide outline-none group-hover:text-white transition-colors">
                  +91 9908504466
                </a>
              </li>
              <li className="flex gap-4 items-center welding-sparkle-card p-3 rounded-lg group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800/80 text-[#0A66C2] border border-slate-700/50">
                  <PhoneCall size={18} />
                </div>
                <a href="tel:08022110244" className="text-sm text-slate-300 font-bold tracking-wide outline-none group-hover:text-white transition-colors">
                  080-22110244
                </a>
              </li>
              <li className="flex gap-4 items-center welding-sparkle-card p-3 rounded-lg group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800/80 text-[#0A66C2] border border-slate-700/50">
                  <Mail size={18} />
                </div>
                <a href="mailto:info@dfab.in" className="text-sm text-slate-300 font-medium outline-none group-hover:text-white transition-colors">
                  info@dfab.in
                </a>
              </li>
              <li className="flex gap-4 items-center welding-sparkle-card p-3 rounded-lg cursor-default">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-800/80 text-[#0A66C2] border border-slate-700/50">
                  <Clock size={18} />
                </div>
                <span className="text-sm text-slate-300 font-medium tracking-wide">
                  Mon - Sat: 9:00 AM - 6:30 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-6 flex flex-col md:flex-row justify-start items-center gap-4 text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase">
          <p>© {currentYear} DFAB STAINLESS SYSTEM PVT LTD. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}