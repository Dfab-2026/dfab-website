import { useEffect, useRef, useState } from "react";

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const mix = (from, to, amount) => from + (to - from) * amount;
// Quintic easing removes the small acceleration/deceleration steps that can
// make scroll-linked transforms feel mechanical.
const smootherstep = (edge0, edge1, value) => {
  const x = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001));
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/**
 * Scroll-driven 3D product reconstruction used only on the Projects page.
 *
 * This intentionally avoids MP4 seeking. The scene is rendered from layered
 * transparent product assets and updated with GPU-friendly 3D transforms, so
 * scroll movement remains fluid even on browsers that struggle with random
 * video seeks.
 */
export default function Product3DScrollScene() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const bgRef = useRef(null);
  const cameraRef = useRef(null);
  const upperRef = useRef(null);
  const lowerRef = useRef(null);
  const finalRef = useRef(null);
  const shadowRef = useRef(null);
  const rafRef = useRef(null);
  const resizeRafRef = useRef(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const lastPaintRef = useRef(-1);
  const metricsRef = useRef({ top: 0, distance: 1, stickyTop: 64 });
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();

    if (media.addEventListener) {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return undefined;

    const measure = () => {
      const stickyTop = 64;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const stickyHeight = sticky.offsetHeight || Math.max(window.innerHeight - stickyTop, 1);
      const distance = Math.max(section.offsetHeight - stickyHeight - stickyTop, 1);
      metricsRef.current = { top, distance, stickyTop };
    };

    const readScroll = () => {
      rafRef.current = null;
      const { top, distance, stickyTop } = metricsRef.current;
      targetRef.current = reducedMotion
        ? 1
        : clamp((window.scrollY + stickyTop - top) / distance);
    };

    const queueRead = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(readScroll);
    };

    const handleResize = () => {
      if (resizeRafRef.current) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        measure();
        readScroll();
      });
    };

    let animationId;
    let lastTime = performance.now();

    const render = (now) => {
      const dt = Math.min(Math.max(now - lastTime, 0), 48);
      lastTime = now;

      const target = targetRef.current;
      const current = currentRef.current;
      const distanceToTarget = Math.abs(target - current);
      const response = distanceToTarget > 0.18 ? 10.5 : 7.5;
      const alpha = reducedMotion ? 1 : 1 - Math.exp((-response * dt) / 1000);
      const p = clamp(
        distanceToTarget < 0.00015 ? target : current + (target - current) * alpha
      );
      currentRef.current = p;

      // Assembly finishes around 62%; the remaining scroll performs a gentle
      // cinematic orbit/dolly on the fully reconstructed product.
      const assemble = smootherstep(0.03, 0.62, p);
      const lock = smootherstep(0.52, 0.76, p);
      const orbit = smootherstep(0.68, 1, p);
      const wholeOpacity = smootherstep(0.60, 0.79, p);
      const splitOpacity = 1 - wholeOpacity;

      const mobile = window.innerWidth < 768;
      const verticalTravel = mobile ? 95 : 145;
      const horizontalTravel = mobile ? 20 : 38;
      const depth = mobile ? 80 : 150;
      const finalScale = mobile ? 1.01 : 1.045;

      if (bgRef.current) {
        bgRef.current.style.transform = `scale(${mix(1.10, 1.025, p)}) translate3d(${mix(-1.2, 1.2, p)}%, ${mix(-0.5, 0.35, p)}%, 0)`;
      }

      // A very small camera orbit gives depth without making the product look
      // detached from the workshop scene. The motion is intentionally subtle.
      if (cameraRef.current) {
        const cameraYaw = mix(-1.6, 0.4, assemble) + orbit * 2.3;
        const cameraPitch = mix(0.8, 0, assemble) - orbit * 0.65;
        const cameraScale = mix(0.992, 1.004, assemble) + orbit * 0.006;
        cameraRef.current.style.transform = `translate3d(0, 0, 0) rotateX(${cameraPitch}deg) rotateY(${cameraYaw}deg) scale(${cameraScale})`;
      }

      if (upperRef.current) {
        const tx = mix(-horizontalTravel, 0, assemble);
        const ty = mix(-verticalTravel, 0, assemble);
        const tz = mix(depth, 20, assemble) + lock * 25;
        const ry = mix(-20, 0, assemble) + orbit * 5;
        const rx = mix(6, 0, assemble) - orbit * 1.5;
        const scale = mix(0.94, 1, assemble);
        upperRef.current.style.opacity = String(splitOpacity);
        upperRef.current.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      }

      if (lowerRef.current) {
        const tx = mix(horizontalTravel, 0, assemble);
        const ty = mix(verticalTravel, 0, assemble);
        const tz = mix(-depth * 0.65, 18, assemble) + lock * 25;
        const ry = mix(20, 0, assemble) + orbit * 5;
        const rx = mix(-5, 0, assemble) - orbit * 1.5;
        const scale = mix(0.94, 1, assemble);
        lowerRef.current.style.opacity = String(splitOpacity);
        lowerRef.current.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      }

      if (finalRef.current) {
        const scale = mix(1.035, 1, wholeOpacity) + orbit * (finalScale - 1) * 0.18;
        finalRef.current.style.opacity = String(wholeOpacity);
        finalRef.current.style.transform = `scale(${scale}) translate3d(0, 0, 0)`;
      }

      if (shadowRef.current) {
        shadowRef.current.style.opacity = String(mix(0.22, 0.48, assemble));
        shadowRef.current.style.transform = `translateX(-50%) scale(${mix(1.22, 0.9, assemble) + orbit * 0.05})`;
      }

      const percent = Math.round(p * 100);
      if (percent !== lastPaintRef.current) {
        lastPaintRef.current = percent;
        setProgress(percent / 100);
      }

      animationId = window.requestAnimationFrame(render);
    };

    measure();
    readScroll();
    window.addEventListener("scroll", queueRead, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    animationId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("scroll", queueRead);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      if (resizeRafRef.current) window.cancelAnimationFrame(resizeRafRef.current);
      if (animationId) window.cancelAnimationFrame(animationId);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full bg-slate-950 ${
        reducedMotion ? "h-[78svh] min-h-[520px]" : "h-[350svh] sm:h-[365svh] md:h-[380vh]"
      }`}
      aria-label="DFAB product 3D reconstruction showcase"
      data-testid="projects-scroll-3d-scene"
    >
      <div
        ref={stickyRef}
        className={`${reducedMotion ? "relative" : "sticky top-16"} relative w-full h-[calc(100svh-4rem)] min-h-[520px] md:min-h-[620px] max-h-[1040px] overflow-hidden bg-slate-950 p-[10px]`}
      >
        <style>{`
          @keyframes dfabFrameLineX {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes dfabFrameLineY {
            0% { background-position: 0 200%; }
            100% { background-position: 0 -200%; }
          }
        `}</style>

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          <span
            className="absolute left-[10px] right-[10px] top-[4px] h-[2px] rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(14,165,233,.16) 22%, rgba(56,189,248,.95) 50%, rgba(14,165,233,.16) 78%, transparent 100%)",
              backgroundSize: "220% 100%",
              animation: "dfabFrameLineX 2.8s linear infinite",
              boxShadow: "0 0 10px rgba(56,189,248,.45)",
            }}
          />
          <span
            className="absolute left-[10px] right-[10px] bottom-[4px] h-[2px] rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(14,165,233,.16) 22%, rgba(56,189,248,.95) 50%, rgba(14,165,233,.16) 78%, transparent 100%)",
              backgroundSize: "220% 100%",
              animation: "dfabFrameLineX 2.8s linear infinite reverse",
              boxShadow: "0 0 10px rgba(56,189,248,.45)",
            }}
          />
          <span
            className="absolute top-[10px] bottom-[10px] left-[4px] w-[2px] rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(14,165,233,.16) 22%, rgba(56,189,248,.95) 50%, rgba(14,165,233,.16) 78%, transparent 100%)",
              backgroundSize: "100% 220%",
              animation: "dfabFrameLineY 3.2s linear infinite reverse",
              boxShadow: "0 0 10px rgba(56,189,248,.45)",
            }}
          />
          <span
            className="absolute top-[10px] bottom-[10px] right-[4px] w-[2px] rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent 0%, rgba(14,165,233,.16) 22%, rgba(56,189,248,.95) 50%, rgba(14,165,233,.16) 78%, transparent 100%)",
              backgroundSize: "100% 220%",
              animation: "dfabFrameLineY 3.2s linear infinite",
              boxShadow: "0 0 10px rgba(56,189,248,.45)",
            }}
          />
        </div>

        <div
          className="relative h-full w-full overflow-hidden bg-slate-950"
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          <img
            ref={bgRef}
            src="/scroll3d/workshop-bg.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            draggable="false"
            aria-hidden="true"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/5 to-slate-950/50" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.04),rgba(2,6,23,0.18)_55%,rgba(2,6,23,0.52)_100%)]" aria-hidden="true" />

          <div
            ref={shadowRef}
            className="absolute left-1/2 bottom-[8%] md:bottom-[7%] w-[28%] md:w-[22%] h-[5%] rounded-full bg-black blur-2xl will-change-transform"
            aria-hidden="true"
          />

          <div
            ref={cameraRef}
            className="absolute inset-0 will-change-transform"
            style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
            aria-hidden="true"
          >
            <img
              ref={upperRef}
              src="/scroll3d/product-upper.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover will-change-transform [filter:drop-shadow(0_24px_28px_rgba(0,0,0,0.30))]"
              draggable="false"
            />
            <img
              ref={lowerRef}
              src="/scroll3d/product-lower.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover will-change-transform [filter:drop-shadow(0_24px_28px_rgba(0,0,0,0.30))]"
              draggable="false"
            />
            <img
              ref={finalRef}
              src="/scroll3d/final-frame.jpg"
              alt="DFAB stainless steel fabricated product"
              className="absolute inset-0 h-full w-full object-cover opacity-0 will-change-transform"
              draggable="false"
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />

          <div className="pointer-events-none absolute left-4 right-4 md:left-8 md:right-8 bottom-5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-75 ease-linear"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="min-w-[42px] text-right text-[10px] md:text-xs font-bold tracking-wider text-white/85 tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
