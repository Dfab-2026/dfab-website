import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const FRAME_COUNT = 160;
const frameSrc = (index) => `/scroll-sequence/frame_${String(index + 1).padStart(3, "0")}.webp`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const SCENES = [
  { from: 0, to: 0.24, eyebrow: "DFAB / MOTION STUDY", title: "Precision in motion", copy: "A closer look at the finish, form and fabrication detail." },
  { from: 0.24, to: 0.5, eyebrow: "01 / SURFACE", title: "Engineered detail", copy: "Smooth cinematic movement keeps every transition connected to your scroll." },
  { from: 0.5, to: 0.76, eyebrow: "02 / FORM", title: "Built with control", copy: "The scene responds progressively instead of jumping between video timestamps." },
  { from: 0.76, to: 1.01, eyebrow: "03 / COMPLETE", title: "Made by DFAB", copy: "Scroll through the final product with a clean, premium presentation." },
];

export default function CinematicScrollSequence() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const visualRef = useRef(null);
  const imagesRef = useRef(new Array(FRAME_COUNT));
  const loadedRef = useRef(new Set());
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastFrameRef = useRef(-1);
  const rafRef = useRef(null);
  const drawRef = useRef(() => {});
  const [loadProgress, setLoadProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const [visibleProgress, setVisibleProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const queue = Array.from({ length: FRAME_COUNT }, (_, index) => index);
    const priority = [0, 1, 2, 3, FRAME_COUNT - 1];

    priority.reverse().forEach((index) => {
      const position = queue.indexOf(index);
      if (position >= 0) queue.splice(position, 1);
      queue.unshift(index);
    });

    const loadOne = (index) =>
      new Promise((resolve) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          if (!cancelled) {
            imagesRef.current[index] = image;
            loadedRef.current.add(index);
            loadedCount += 1;
            if (loadedCount === 1 || loadedCount % 8 === 0 || loadedCount === FRAME_COUNT) {
              setLoadProgress(loadedCount / FRAME_COUNT);
            }
            if (index === 0 || index === lastFrameRef.current) drawRef.current();
          }
          resolve();
        };
        image.onerror = () => resolve();
        image.src = frameSrc(index);
      });

    const workers = Array.from({ length: 8 }, async () => {
      while (!cancelled && queue.length) {
        const index = queue.shift();
        if (index === undefined) break;
        await loadOne(index);
      }
    });

    Promise.all(workers).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const visual = visualRef.current;
    if (!section || !canvas || !visual) return undefined;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return undefined;

    let displayWidth = 0;
    let displayHeight = 0;
    let dpr = 1;

    const findNearestLoaded = (wanted) => {
      if (loadedRef.current.has(wanted)) return wanted;
      for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
        const before = wanted - distance;
        const after = wanted + distance;
        if (before >= 0 && loadedRef.current.has(before)) return before;
        if (after < FRAME_COUNT && loadedRef.current.has(after)) return after;
      }
      return -1;
    };

    const drawCurrentFrame = () => {
      const wanted = clamp(Math.round(currentRef.current * (FRAME_COUNT - 1)), 0, FRAME_COUNT - 1);
      const frameIndex = findNearestLoaded(wanted);
      if (frameIndex < 0) return;
      const image = imagesRef.current[frameIndex];
      if (!image || !displayWidth || !displayHeight) return;

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const viewRatio = displayWidth / displayHeight;
      let sourceWidth = image.naturalWidth;
      let sourceHeight = image.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;

      if (imageRatio > viewRatio) {
        sourceWidth = image.naturalHeight * viewRatio;
        sourceX = (image.naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = image.naturalWidth / viewRatio;
        sourceY = (image.naturalHeight - sourceHeight) / 2;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        displayWidth,
        displayHeight
      );
      lastFrameRef.current = wanted;
    };

    drawRef.current = drawCurrentFrame;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      displayWidth = Math.max(1, rect.width);
      displayHeight = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nextWidth = Math.round(displayWidth * dpr);
      const nextHeight = Math.round(displayHeight * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      drawCurrentFrame();
    };

    const updateTarget = () => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const range = Math.max(section.offsetHeight - window.innerHeight, 1);
      targetRef.current = clamp((window.scrollY - sectionTop) / range, 0, 1);
    };

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.04);
      lastTimeRef.current = time;

      const target = targetRef.current;
      let current = currentRef.current;
      let velocity = velocityRef.current;

      // Soft critically-damped movement gives the premium scroll feel without
      // letting the media lag too far behind fast wheel/touch gestures.
      const stiffness = 92;
      const damping = 19;
      const acceleration = stiffness * (target - current) - damping * velocity;
      velocity += acceleration * dt;
      velocity = clamp(velocity, -1.65, 1.65);
      current += velocity * dt;

      if (Math.abs(target - current) < 0.00015 && Math.abs(velocity) < 0.001) {
        current = target;
        velocity = 0;
      }

      current = clamp(current, 0, 1);
      currentRef.current = current;
      velocityRef.current = velocity;

      const frame = Math.round(current * (FRAME_COUNT - 1));
      if (frame !== lastFrameRef.current) drawCurrentFrame();

      const sceneIndex = SCENES.findIndex((scene) => current >= scene.from && current < scene.to);
      const resolvedScene = sceneIndex < 0 ? SCENES.length - 1 : sceneIndex;
      setActiveScene((previous) => (previous === resolvedScene ? previous : resolvedScene));

      const percent = Math.round(current * 1000) / 10;
      setVisibleProgress((previous) => (Math.abs(previous - percent) >= 0.8 ? percent : previous));

      const yaw = (current - 0.5) * 2.2;
      const pitch = Math.sin(current * Math.PI) * -0.65;
      const lift = Math.sin(current * Math.PI * 2) * 4;
      const scale = 1.035 + Math.sin(current * Math.PI) * 0.018;
      visual.style.transform = `perspective(1400px) translate3d(0, ${lift}px, 0) rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${scale})`;

      rafRef.current = window.requestAnimationFrame(animate);
    };

    const onScroll = () => updateTarget();
    const onResize = () => {
      resize();
      updateTarget();
    };

    resize();
    updateTarget();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      drawRef.current = () => {};
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scene = SCENES[activeScene];
  const ready = loadProgress >= 0.12;

  return (
    <section
      ref={sectionRef}
      className="relative h-[390vh] bg-[#05080d]"
      aria-label="DFAB cinematic product scroll experience"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-[#05080d]">
        <div
          ref={visualRef}
          className="absolute inset-[-2%] will-change-transform transition-[filter] duration-500"
          style={{ filter: ready ? "none" : "blur(4px)" }}
        >
          <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_30%,rgba(2,6,12,0.28)_68%,rgba(2,6,12,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/75 to-transparent" />

        {!ready && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[#05080d]">
            <div className="w-[min(360px,78vw)] text-center">
              <div className="mx-auto mb-5 h-px w-20 bg-white/25" />
              <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/55">Preparing motion study</p>
              <div className="mt-4 h-[2px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-white/70 transition-[width] duration-300"
                  style={{ width: `${Math.max(4, Math.round(loadProgress * 100))}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-white/40">{Math.round(loadProgress * 100)}%</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-20 flex flex-col justify-between px-5 py-7 md:px-10 md:py-10 lg:px-14">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#2c8fe8]" />
                <span className="text-[10px] font-black uppercase tracking-[0.34em] text-white/70">DFAB</span>
              </div>
              <p className="mt-2 max-w-xs text-[10px] uppercase tracking-[0.26em] text-white/35">Precision fabrication / Bengaluru</p>
            </div>
            <div className="hidden text-right md:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">Scroll experience</p>
              <p className="mt-1 font-mono text-xs text-white/70">{String(Math.round(visibleProgress)).padStart(3, "0")}%</p>
            </div>
          </div>

          <div className="grid items-end gap-8 md:grid-cols-[minmax(0,620px)_1fr]">
            <div className="max-w-2xl">
              <div key={activeScene} className="transition-opacity duration-500">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.34em] text-[#59aef6] md:text-xs">{scene.eyebrow}</p>
                <h2 className="font-['Chivo'] text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
                  {scene.title}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-6 text-white/62 md:text-base">{scene.copy}</p>
              </div>
            </div>

            <div className="hidden justify-self-end md:block">
              <div className="flex items-end gap-4">
                <div className="h-32 w-px overflow-hidden bg-white/15">
                  <div
                    className="w-full origin-top bg-[#4aa3ef]"
                    style={{ height: `${Math.max(2, visibleProgress)}%` }}
                  />
                </div>
                <div className="pb-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">Progress</p>
                  <p className="mt-2 font-mono text-lg text-white">{Math.round(visibleProgress)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex items-center gap-3 text-white/45">
              <ChevronDown size={15} className="animate-bounce" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Scroll to explore</span>
            </div>
            <div className="flex gap-1.5" aria-hidden="true">
              {SCENES.map((_, index) => (
                <span
                  key={index}
                  className={`h-1 rounded-full transition-all duration-500 ${index === activeScene ? "w-8 bg-[#4aa3ef]" : "w-3 bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
