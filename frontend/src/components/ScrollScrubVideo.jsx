import { useEffect, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const mix = (from, to, amount) => from + (to - from) * amount;

/**
 * Full-width scroll-scrub video.
 *
 * The default/non-pinned behavior is intentionally kept compatible with the
 * existing Services usage. Projects can opt into the `cinematic3d` mode, which
 * uses a longer pinned scroll track, critically damped scroll interpolation,
 * frame-oriented media seeks and a very subtle perspective camera treatment.
 *
 * The visual camera motion is independent from video decoding. That means the
 * page still reacts continuously to the user's wheel/touch input while the
 * browser resolves the nearest video frame, avoiding the stop/start feeling of
 * a normal currentTime-only scrubber.
 */
export default function ScrollScrubVideo({
  src = "/videos/products-scroll.mp4",
  playbackSpeed = 1.65,
  pinUntilComplete = false,
  cinematic3d = false,
}) {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const lightRef = useRef(null);
  const progressBarRef = useRef(null);

  const animationRef = useRef(null);
  const scrollRafRef = useRef(null);
  const resizeRafRef = useRef(null);

  const durationRef = useRef(0);
  const readyRef = useRef(false);
  const metricsRef = useRef({ sectionTop: 0, scrubDistance: 1, stickyTop: 64 });

  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const springVelocityRef = useRef(0);
  const lastProgressPaintRef = useRef(-1);

  const pendingSeekTimeRef = useRef(0);
  const lastAppliedTimeRef = useRef(-1);
  const seekInFlightRef = useRef(false);
  const lastSeekAtRef = useRef(0);
  const lastAnimationAtRef = useRef(0);

  const [videoReady, setVideoReady] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();

    if (media.addEventListener) {
      media.addEventListener("change", syncPreference);
      return () => media.removeEventListener("change", syncPreference);
    }

    media.addListener(syncPreference);
    return () => media.removeListener(syncPreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return undefined;

    const prefersReducedMotion = reducedMotion;
    const useCinematicMode = Boolean(pinUntilComplete && cinematic3d);
    const SEEK_INTERVAL_MS = useCinematicMode ? 28 : 42;

    const measure = () => {
      const stickyTop = 64;
      const sectionTop =
        section.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      const stickyHeight =
        stickyRef.current?.offsetHeight || Math.max(window.innerHeight - stickyTop, 1);
      const scrubDistance = pinUntilComplete
        ? Math.max(section.offsetHeight - stickyHeight - stickyTop, 1)
        : Math.max(section.offsetHeight * 0.95, 1);

      metricsRef.current = { sectionTop, scrubDistance, stickyTop };
    };

    const paintCinematicCamera = (progress, velocity) => {
      if (!useCinematicMode || !stageRef.current) return;

      const normalizedVelocity = clamp(velocity * 0.32, -1, 1);
      const centerPulse = Math.sin(progress * Math.PI);
      const cameraYaw = Math.sin(progress * Math.PI * 1.25) * 0.85 + normalizedVelocity * 0.55;
      const cameraPitch = Math.cos(progress * Math.PI) * 0.38 - normalizedVelocity * 0.18;
      const cameraScale = 1.045 + centerPulse * 0.018 + Math.abs(normalizedVelocity) * 0.006;
      const cameraY = mix(6, -5, progress) + normalizedVelocity * 1.8;

      stageRef.current.style.transform =
        `translate3d(0, ${cameraY}px, 0) ` +
        `rotateX(${cameraPitch}deg) rotateY(${cameraYaw}deg) scale(${cameraScale})`;

      if (lightRef.current) {
        const lightX = mix(-18, 118, progress);
        lightRef.current.style.transform =
          `translate3d(${lightX}vw, ${normalizedVelocity * -3}px, 0) rotate(10deg)`;
        lightRef.current.style.opacity = String(0.12 + centerPulse * 0.13);
      }
    };

    const calculateScrollTarget = () => {
      scrollRafRef.current = null;

      if (!readyRef.current || !durationRef.current) return;

      if (prefersReducedMotion) {
        targetProgressRef.current = 0;
        smoothProgressRef.current = 0;
        springVelocityRef.current = 0;
        setScrollProgress(0);
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const { sectionTop, scrubDistance, stickyTop } = metricsRef.current;

      let progress;
      if (pinUntilComplete) {
        progress = clamp((scrollY + stickyTop - sectionTop) / scrubDistance, 0, 1);
      } else {
        const rawProgress = clamp((scrollY - sectionTop) / scrubDistance, 0, 1);
        progress = clamp(rawProgress * playbackSpeed, 0, 1);
      }

      targetProgressRef.current = progress;

      if (pinUntilComplete && progress >= 0.9995) {
        const finalTime = Math.max(durationRef.current - 0.01, 0);
        targetProgressRef.current = 1;

        // Do not hard-jump the cinematic camera to 100%. The spring loop is
        // allowed to finish naturally; only the media is guaranteed to end.
        if (!useCinematicMode) {
          smoothProgressRef.current = 1;
          springVelocityRef.current = 0;
        }

        pendingSeekTimeRef.current = finalTime;

        if (!seekInFlightRef.current || useCinematicMode) {
          try {
            video.currentTime = finalTime;
            lastAppliedTimeRef.current = finalTime;
          } catch (_) {
            // Browser may still be settling metadata; the animation loop retries.
          }
        }
      }
    };

    const queueScrollCalculation = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = window.requestAnimationFrame(calculateScrollTarget);
    };

    const handleResize = () => {
      if (resizeRafRef.current) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        measure();
        calculateScrollTarget();
      });
    };

    const applyPendingSeek = (now) => {
      if (!readyRef.current || !durationRef.current || prefersReducedMotion) return;
      if (!useCinematicMode && seekInFlightRef.current) return;
      if (now - lastSeekAtRef.current < SEEK_INTERVAL_MS) return;

      const maxTime = Math.max(durationRef.current - 0.01, 0);
      const nextTime = clamp(pendingSeekTimeRef.current, 0, maxTime);
      const timeDiff = Math.abs(nextTime - lastAppliedTimeRef.current);
      const minimumSeekDelta = useCinematicMode ? 0.014 : 0.025;

      if (timeDiff < minimumSeekDelta) return;

      try {
        lastSeekAtRef.current = now;
        lastAppliedTimeRef.current = nextTime;

        if (useCinematicMode) {
          // The Projects clip is encoded with every frame as a keyframe. Keeping
          // only the newest requested timestamp lets the browser coalesce seeks
          // instead of waiting for a stale seeked event before following scroll.
          video.currentTime = nextTime;
        } else {
          seekInFlightRef.current = true;
          video.currentTime = nextTime;
        }
      } catch (_) {
        seekInFlightRef.current = false;
      }
    };

    const renderFrame = (now) => {
      if (!lastAnimationAtRef.current) lastAnimationAtRef.current = now;
      const dtMs = Math.min(Math.max(now - lastAnimationAtRef.current, 0), 50);
      const dt = dtMs / 1000;
      lastAnimationAtRef.current = now;

      if (readyRef.current && durationRef.current && !prefersReducedMotion) {
        const target = targetProgressRef.current;
        let current = smoothProgressRef.current;
        let velocity = springVelocityRef.current;

        if (useCinematicMode) {
          // Critically damped spring. It removes the mechanical frame-by-frame
          // feeling while staying tightly attached to the user's scroll input.
          const stiffness = 170;
          const damping = 26;
          const displacement = target - current;
          const acceleration = stiffness * displacement - damping * velocity;

          velocity += acceleration * dt;
          velocity = clamp(velocity, -2.6, 2.6);
          current += velocity * dt;

          if (Math.abs(displacement) < 0.00008 && Math.abs(velocity) < 0.0008) {
            current = target;
            velocity = 0;
          }
        } else {
          const distance = Math.abs(target - current);
          const response = distance > 0.12 ? 15 : 10;
          const alpha = 1 - Math.exp((-response * dtMs) / 1000);
          current = distance < 0.0005 ? target : current + (target - current) * alpha;
          velocity = 0;
        }

        current = clamp(current, 0, 1);
        smoothProgressRef.current = current;
        springVelocityRef.current = velocity;
        pendingSeekTimeRef.current = current * durationRef.current;

        paintCinematicCamera(current, velocity);

        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${current})`;
        }

        const progressPercent = Math.round(current * 100);
        if (progressPercent !== lastProgressPaintRef.current) {
          lastProgressPaintRef.current = progressPercent;
          setScrollProgress(progressPercent / 100);
        }

        applyPendingSeek(now);
      }

      animationRef.current = window.requestAnimationFrame(renderFrame);
    };

    const markReady = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;

      durationRef.current = video.duration;
      readyRef.current = true;
      setVideoUnavailable(false);
      setVideoReady(true);

      video.pause();
      targetProgressRef.current = 0;
      smoothProgressRef.current = 0;
      springVelocityRef.current = 0;
      pendingSeekTimeRef.current = 0;
      lastAppliedTimeRef.current = -1;
      seekInFlightRef.current = false;

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = "scaleX(0)";
      }
      paintCinematicCamera(0, 0);

      try {
        video.currentTime = 0;
      } catch (_) {
        // Harmless if the browser is finalizing media metadata.
      }

      measure();
      calculateScrollTarget();
    };

    const handleSeeked = () => {
      seekInFlightRef.current = false;
    };

    const handleError = () => {
      readyRef.current = false;
      seekInFlightRef.current = false;
      setVideoReady(false);
      setVideoUnavailable(true);
    };

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);
    window.addEventListener("scroll", queueScrollCalculation, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    measure();

    if (video.readyState >= 1) {
      markReady();
    }

    animationRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      window.removeEventListener("scroll", queueScrollCalculation);
      window.removeEventListener("resize", handleResize);

      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
      if (resizeRafRef.current) window.cancelAnimationFrame(resizeRafRef.current);
    };
  }, [pinUntilComplete, playbackSpeed, reducedMotion, src, cinematic3d]);

  const videoContent = (
    <>
      <div className="absolute inset-0 overflow-hidden bg-slate-950">
        <div
          ref={stageRef}
          className={`absolute ${cinematic3d ? "-inset-[4%]" : "inset-0"} will-change-transform`}
          style={{
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover bg-slate-950 transition-opacity duration-300 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            src={src}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
          />
        </div>
      </div>

      {!videoReady && !videoUnavailable && (
        <div className="absolute inset-0 bg-slate-950 animate-pulse" aria-hidden="true" />
      )}

      {videoUnavailable && <div className="absolute inset-0 bg-slate-950" aria-hidden="true" />}

      {cinematic3d && (
        <>
          <div
            ref={lightRef}
            className="pointer-events-none absolute -left-[45vw] top-[-20%] h-[140%] w-[38vw] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-3xl will-change-transform"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(2,6,23,0.18)_72%,rgba(2,6,23,0.48)_100%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5"
            aria-hidden="true"
          />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/50 to-transparent" />

      <div className="pointer-events-none absolute left-4 right-4 md:left-8 md:right-8 bottom-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left rounded-full bg-white will-change-transform"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>
        <span className="min-w-[42px] text-right text-[10px] md:text-xs font-bold tracking-wider text-white/80 tabular-nums">
          {Math.round(scrollProgress * 100)}%
        </span>
      </div>
    </>
  );

  if (pinUntilComplete && !reducedMotion) {
    return (
      <section
        ref={sectionRef}
        className={`relative w-full bg-slate-950 ${
          cinematic3d
            ? "h-[430svh] sm:h-[460svh] md:h-[500vh] lg:h-[520vh]"
            : "h-[270svh] sm:h-[285svh] md:h-[300vh] lg:h-[320vh]"
        }`}
        aria-label="DFAB manufacturing video showcase"
        data-testid="projects-scroll-video"
      >
        <div
          ref={stickyRef}
          className="sticky top-16 w-full h-[calc(100svh-4rem)] min-h-[420px] md:min-h-[560px] max-h-[980px] overflow-hidden bg-slate-950"
          style={cinematic3d ? { perspective: "1600px" } : undefined}
        >
          {videoContent}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[42vh] sm:h-[50vh] md:h-[58vh] lg:h-[64vh] min-h-[300px] max-h-[720px] overflow-hidden bg-slate-950"
      aria-label="DFAB manufacturing video showcase"
      data-testid="projects-scroll-video"
    >
      {videoContent}
    </section>
  );
}
