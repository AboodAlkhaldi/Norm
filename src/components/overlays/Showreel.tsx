"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { media } from "@/content/media";
import { VideoTile } from "@/components/media/VideoTile";
import { gsap } from "@/lib/gsap";
import { getLenis, lockScroll } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Ctx = {
  /** Open the showreel; pass the element it should grow out of (the hero reel box). */
  open: (from?: HTMLElement | null) => void;
  /** Start fetching the reel early (on hover / focus of the hero). */
  warm: () => void;
  /** True while the reel is open (the hero pauses its own video meanwhile). */
  isOpen: boolean;
};
const ShowreelContext = createContext<Ctx>({ open: () => {}, warm: () => {}, isOpen: false });
export const useShowreel = () => useContext(ShowreelContext);

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
/** MM:SS */
const short = (s: number) => `${pad(s / 60)}:${pad(s % 60)}`;
/** Controls hide after this long without pointer movement while the reel plays. */
const IDLE_MS = 2600;
/** Thumbnails shown inside the timeline pill. */
const STRIP = 9;

/**
 * Pick the reel quality once per session: 1080p only on large screens with a
 * fast connection and no data-saver; 720p (≈1.6 Mbps) otherwise, so playback
 * starts fast and does not stall.
 */
function chooseSource() {
  const reel = media.showreel;
  if (!reel.srcHigh) return reel.src;
  const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean; downlink?: number } };
  const c = nav.connection;
  const fast = !c || (c.effectiveType === "4g" && !c.saveData && (c.downlink ?? 10) >= 5);
  const big = window.innerWidth * (window.devicePixelRatio || 1) >= 2200;
  return fast && big ? reel.srcHigh : reel.src;
}

export function ShowreelProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false); // overlay exists (reel preloading)
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);

  const warm = useCallback(() => setMounted(true), []);
  const open = useCallback((from?: HTMLElement | null) => {
    setOrigin(from ?? null);
    setMounted(true);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, warm, isOpen }), [open, warm, isOpen]);

  return (
    <ShowreelContext.Provider value={value}>
      {children}
      {mounted && <ShowreelOverlay isOpen={isOpen} onClose={close} origin={origin} />}
    </ShowreelContext.Provider>
  );
}

/** Copy the frame currently showing in `v` onto the canvas. */
function drawFrame(v: HTMLVideoElement | null | undefined, canvas: HTMLCanvasElement | null) {
  if (!canvas || !v || v.readyState < 2 || !v.videoWidth) return false;
  canvas.width = v.videoWidth;
  canvas.height = v.videoHeight;
  try {
    canvas.getContext("2d")?.drawImage(v, 0, 0);
    return true;
  } catch {
    return false;
  }
}

type Frames = NonNullable<typeof media.showreel.frames>;

/**
 * One frame of the reel's thumbnail sprite filling its box. The box keeps the
 * frame's aspect ratio; percentage positions make it work at any size.
 */
function SpriteFrame({ frames, index, className = "" }: { frames: Frames; index: number; className?: string }) {
  const rows = Math.ceil(frames.count / frames.cols);
  const i = Math.max(0, Math.min(frames.count - 1, index));
  const col = i % frames.cols;
  const row = Math.floor(i / frames.cols);
  return (
    <span
      aria-hidden="true"
      className={`block bg-no-repeat ${className}`}
      style={{
        aspectRatio: `${frames.width} / ${frames.height}`,
        backgroundImage: `url(${frames.src})`,
        backgroundSize: `${frames.cols * 100}% ${rows * 100}%`,
        backgroundPosition: `${(col / (frames.cols - 1)) * 100}% ${(row / Math.max(1, rows - 1)) * 100}%`,
      }}
    />
  );
}

/**
 * Showreel — opening "Letterbox" (owner's choice, MOTION.md §15): the hero box widens
 * to full screen, then cinema bars slide in while the picture settles into the reel's
 * wide format.
 *
 * Player (owner: Studio Size's controls, improved): a centred group in the bottom bar
 * — play/pause circle, a timeline pill made of frames from the reel (unplayed part
 * dimmed, red playhead; hovering shows a larger frame and the time), sound circle —
 * and a close circle bottom-right. Progress is drawn every frame (no stepping),
 * scrubbing pauses and resumes, and the controls and cursor fade away while the reel
 * plays untouched. Closing: the controls drop away, the sound fades, the current
 * frame is held while the picture flies back into the hero box (bars retracting at
 * the same time) and dissolves into the live preview; the page is exactly where it was.
 */
function ShowreelOverlay({ isOpen, onClose, origin }: { isOpen: boolean; onClose: () => void; origin: HTMLElement | null }) {
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLCanvasElement>(null); // hero frame (opening)
  const still = useRef<HTMLCanvasElement>(null); // reel frame held while closing
  const barTop = useRef<HTMLDivElement>(null);
  const barBottom = useRef<HTMLDivElement>(null);
  const ui = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLSpanElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const openTl = useRef<gsap.core.Timeline | null>(null);
  const closeTl = useRef<gsap.core.Timeline | null>(null);
  const savedScroll = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const scrub = useRef<{ wasPlaying: boolean } | null>(null);
  const originRef = useRef(origin);
  useEffect(() => {
    originRef.current = origin;
  }, [origin]);

  const frames = media.showreel.frames;
  const [src] = useState(chooseSource);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [idle, setIdle] = useState(false);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);

  useFocusTrap(root, isOpen);

  // Open / close.
  useEffect(() => {
    const el = root.current!;
    const v = video.current;
    const instant = prefersReducedMotion();

    if (isOpen) {
      const g = geometry();
      el.style.setProperty("--bar", `${g.bar}px`);
      // Re-opened while closing: go straight back to the player.
      if (closeTl.current) {
        closeTl.current.kill();
        closeTl.current = null;
        gsap.to(box.current, { left: 0, top: g.bar, width: g.vw, height: g.bandH, borderRadius: 0, opacity: 1, duration: 0.5, ease: "page" });
        gsap.to([barTop.current, barBottom.current], { height: g.bar, duration: 0.5, ease: "page" });
        gsap.to(still.current, { opacity: 0, duration: 0.3, ease: "ui" });
        gsap.to(ui.current, { opacity: 1, y: 0, duration: 0.4, ease: "ui" });
        if (v) {
          gsap.to(v, { volume: 1, duration: 0.3, overwrite: true });
          v.play().catch(() => {});
        }
        setPaused(false);
        return;
      }
      opener.current = document.activeElement as HTMLElement | null;
      savedScroll.current = window.scrollY;
      lockScroll(true);
      gsap.set(el, { display: "block", visibility: "visible", opacity: 1 });
      gsap.set(still.current, { opacity: 0 });
      const hasFrame = drawFrame(originRef.current?.querySelector("video"), frame.current);
      gsap.set(frame.current, { opacity: hasFrame ? 1 : 0 });
      const r = instant ? null : (originRef.current?.getBoundingClientRect() ?? null);
      const onScreen = !!r && r.width > 0 && r.bottom > 0 && r.top < g.vh;

      const t = gsap.timeline({ onComplete: () => void (openTl.current = null) });
      if (onScreen && r) {
        t.fromTo(
          box.current,
          { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 5, opacity: 1 },
          { left: 0, top: 0, width: g.vw, height: g.vh, borderRadius: 0, duration: 0.95, ease: "page" },
        )
          .fromTo([barTop.current, barBottom.current], { height: 0 }, { height: g.bar, duration: 0.65, ease: "page" }, 0.7)
          .to(box.current, { top: g.bar, height: g.bandH, duration: 0.65, ease: "page" }, 0.7)
          .to(frame.current, { opacity: 0, duration: 0.5, ease: "ui" }, 0.85)
          .fromTo(ui.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "page" }, 1.15);
      } else {
        gsap.set(box.current, { left: 0, top: g.bar, width: g.vw, height: g.bandH, borderRadius: 0, opacity: 1 });
        gsap.set([barTop.current, barBottom.current], { height: g.bar });
        gsap.set(frame.current, { opacity: 0 });
        t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: instant ? 0 : 0.5, ease: "page" }).fromTo(
          ui.current,
          { opacity: 0, y: 0 },
          { opacity: 1, duration: instant ? 0 : 0.4, ease: "ui" },
          instant ? 0 : 0.2,
        );
      }
      openTl.current = t;
      if (v) {
        gsap.killTweensOf(v);
        v.volume = 1;
        v.currentTime = 0;
        v.play().catch(() => setPaused(true));
      }
      setPaused(false);
      setIdle(false);
      el.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus({ preventScroll: true });
      return;
    }

    // Close (only if actually open and not already closing).
    if (el.style.display === "none" || closeTl.current) return;
    openTl.current?.kill();
    openTl.current = null;
    setHover(null);
    const g = geometry();
    // Hold the current reel frame so nothing changes under the moving picture.
    gsap.set(still.current, { opacity: drawFrame(v, still.current) ? 1 : 0 });
    const r = instant ? null : (originRef.current?.getBoundingClientRect() ?? null);
    const onScreen = !!r && r.width > 0 && r.bottom > 0 && r.top < g.vh;
    const finish = () => {
      closeTl.current = null;
      gsap.set(el, { display: "none", visibility: "hidden" });
      gsap.set(box.current, { opacity: 1 });
      if (v) {
        v.pause();
        v.volume = 1;
      }
      lockScroll(false);
      // Land exactly where the visitor was.
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(savedScroll.current, { immediate: true, force: true });
      else window.scrollTo(0, savedScroll.current);
      opener.current?.focus?.({ preventScroll: true });
    };
    const t = gsap.timeline({ onComplete: finish });
    t.to(ui.current, { opacity: 0, y: 14, duration: instant ? 0 : 0.3, ease: "ui" }, 0);
    if (v) t.to(v, { volume: 0, duration: instant ? 0 : 0.45, ease: "none", onComplete: () => v.pause() }, 0);
    if (onScreen && r) {
      t.to([barTop.current, barBottom.current], { height: 0, duration: 0.75, ease: "page" }, 0.12)
        .to(box.current, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 5, duration: 0.95, ease: "page" }, 0.12)
        .to(box.current, { opacity: 0, duration: 0.4, ease: "ui" }, 0.8);
    } else {
      t.to(el, { opacity: 0, duration: instant ? 0 : 0.5, ease: "page" }, 0.1);
    }
    closeTl.current = t;
  }, [isOpen]);

  // Keep the letterbox right if the window is resized while open.
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => {
      const g = geometry();
      root.current?.style.setProperty("--bar", `${g.bar}px`);
      if (openTl.current) return;
      gsap.set(box.current, { left: 0, top: g.bar, width: g.vw, height: g.bandH });
      gsap.set([barTop.current, barBottom.current], { height: g.bar });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);

  // Timeline drawn every frame from the video clock (smooth, no 4 Hz steps).
  useEffect(() => {
    if (!isOpen) return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v && v.duration && dim.current && !scrub.current) {
        dim.current.style.left = `${(v.currentTime / v.duration) * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Hide the controls (and cursor) after a moment without movement while playing.
  useEffect(() => {
    if (!isOpen || paused || idle) return;
    const t = window.setTimeout(() => setIdle(true), IDLE_MS);
    return () => window.clearTimeout(t);
  }, [isOpen, paused, idle, hover]);
  // The outline play/pause cursor leaves together with the controls (and comes back with them).
  useEffect(() => {
    window.dispatchEvent(new Event("norm:cursor-recheck"));
  }, [idle]);
  const wake = () => {
    if (idle) setIdle(false);
  };

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  }, []);

  const toggleSound = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const seekBy = useCallback((d: number) => {
    const v = video.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + d));
    setTime(v.currentTime);
  }, []);

  // Keyboard: Esc closes, Space pauses, M mutes, ←/→ skip 5 s. Any key shows the controls.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const onButton = !!target?.closest("button");
      const onSlider = !!target?.closest("[role=slider]");
      setIdle(false);
      if (e.key === "Escape") onClose();
      else if (e.key === " " && !onButton) {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === "m") toggleSound();
      else if (e.key === "ArrowRight" && !onSlider) seekBy(5);
      else if (e.key === "ArrowLeft" && !onSlider) seekBy(-5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, toggle, toggleSound, seekBy]);

  /** Position on the timeline under clientX (fraction + px from its left edge). */
  const at = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const x = Math.min(r.width, Math.max(0, clientX - r.left));
    return { p: r.width ? x / r.width : 0, x };
  };
  const seekTo = (p: number) => {
    const v = video.current;
    if (!v || !v.duration) return;
    if (dim.current) dim.current.style.left = `${p * 100}%`;
    const t = p * v.duration;
    v.currentTime = t;
    setTime(t);
  };

  const hoverFrame = frames && hover && duration ? Math.floor((hover.t / duration) * frames.count) : 0;
  const circle = "group/btn grid size-circle shrink-0 place-items-center overflow-hidden rounded-full bg-pill text-fg";
  // Studio Size hover: a lighter disc grows from the centre.
  const overlay =
    "pointer-events-none absolute inset-0 scale-0 rounded-full bg-[#434343] transition-transform duration-300 ease-ui group-hover/btn:scale-100";
  // Centred in the bottom bar; 20px from the bottom when the bar is too thin.
  const bottom = "max(20px, calc(var(--bar) / 2 - var(--circle) / 2))";

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="NORM showreel"
      className={`fixed inset-0 z-[80] ${idle ? "cursor-none" : ""}`}
      style={{ display: "none", visibility: "hidden" }}
      data-lenis-prevent=""
      onPointerMove={wake}
      onPointerDown={wake}
    >
      {/* The picture */}
      <div ref={box} className="absolute overflow-hidden bg-black" style={{ left: 0, top: 0, width: "100%", height: "100%" }}>
        <VideoTile
          media={media.showreel}
          src={src}
          mode="manual"
          active={isOpen && !paused}
          eager
          preload="auto"
          requireInView={false}
          allowWithReducedMotion
          muted={muted}
          loop
          fit="cover"
          sizes="100vw"
          className="size-full"
          videoRef={(el) => {
            video.current = el;
          }}
          onTimeUpdate={(e) => {
            if (!scrub.current) setTime(e.currentTarget.currentTime);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
        />
        {/* Hero preview frame (opening) and held reel frame (closing) */}
        <canvas ref={frame} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full object-cover" />
        <canvas ref={still} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full object-cover opacity-0" />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={toggle}
          data-cursor={idle ? undefined : paused ? "play" : "pause"}
          className={`absolute inset-0 ${idle ? "cursor-none" : "cursor-pointer"}`}
        />
      </div>

      {/* Cinema bars */}
      <div ref={barTop} className="absolute inset-x-0 top-0 bg-bg" style={{ height: 0 }} />
      <div ref={barBottom} className="absolute inset-x-0 bottom-0 bg-bg" style={{ height: 0 }} />

      {/* Controls. GSAP fades this layer on open / close; the inner layer handles idle. */}
      <div ref={ui} className="pointer-events-none absolute inset-0 text-fg" style={{ opacity: 0 }}>
        <div className={`absolute inset-0 transition-[opacity,translate] duration-500 ease-ui ${idle ? "translate-y-3 opacity-0" : "opacity-100"}`}>
          <div
            className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-[10px]"
            style={{ bottom }}
            onPointerEnter={() => setIdle(false)}
          >
            <button type="button" onClick={toggle} data-autofocus="" aria-label={paused ? "Play" : "Pause"} className={`${circle} relative`}>
              <span className={overlay} />
              {buffering && !paused ? (
                <svg viewBox="0 0 24 24" className="relative size-5 animate-spin" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                  <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : paused ? (
                <svg viewBox="0 0 12 14" className="relative ml-0.5 size-3" aria-hidden="true">
                  <path d="M12 7L0 14V0z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 8 16" className="relative h-3.5 w-2" aria-hidden="true">
                  <path d="M0 15V0h2v15zM8 0v15H6V0z" fill="currentColor" />
                </svg>
              )}
            </button>

            {/* Timeline pill made of reel frames */}
            <div
              ref={track}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${short(time)} of ${short(duration)}`}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") seekBy(5);
                if (e.key === "ArrowLeft") seekBy(-5);
                if (e.key === "Home") seekBy(-1e6);
                if (e.key === "End") seekBy(1e6);
              }}
              onPointerDown={(e) => {
                const v = video.current;
                e.currentTarget.setPointerCapture(e.pointerId);
                scrub.current = { wasPlaying: !!v && !v.paused };
                v?.pause();
                seekTo(at(e.clientX).p);
              }}
              onPointerMove={(e) => {
                const { p, x } = at(e.clientX);
                setHover({ x, t: p * duration });
                if (scrub.current) seekTo(p);
              }}
              onPointerUp={() => {
                const s = scrub.current;
                scrub.current = null;
                if (s?.wasPlaying) video.current?.play().catch(() => {});
              }}
              onPointerLeave={() => {
                if (!scrub.current) setHover(null);
              }}
              className="relative h-circle w-[clamp(180px,calc(320*var(--u)),440px)] cursor-pointer touch-none rounded-[70px] bg-black"
            >
              <div className="absolute inset-0 flex overflow-hidden rounded-[70px]">
                {frames &&
                  Array.from({ length: STRIP }, (_, k) => (
                    <span key={k} className="relative h-full min-w-0 flex-1 overflow-hidden">
                      <SpriteFrame
                        frames={frames}
                        index={Math.round(((k + 0.5) / STRIP) * frames.count)}
                        className="absolute left-1/2 top-0 h-full -translate-x-1/2"
                      />
                    </span>
                  ))}
                {/* Unplayed part: dimmed, red playhead on its left edge (Studio Size) */}
                <span ref={dim} className="absolute inset-y-0 right-0 border-l-[3px] border-[#ff1b1b] bg-black/60" style={{ left: "0%" }} />
              </div>
              {/* Hover / scrub preview: a larger frame and the time */}
              {frames && hover && duration > 0 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full mb-3 w-[clamp(132px,calc(176*var(--u)),220px)] -translate-x-1/2"
                  style={{ left: hover.x }}
                >
                  <SpriteFrame frames={frames} index={hoverFrame} className="w-full rounded-media" />
                  <span className="mt-2 block text-center text-ui tabular-nums">{short(hover.t)}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? "Sound on" : "Sound off"}
              title={media.showreel.hasAudio ? undefined : "This placeholder reel has no audio track"}
              className={`${circle} relative`}
            >
              <span className={overlay} />
              <svg viewBox="0 0 20 16" className="relative h-3.5 w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M1 5.5h3.5L9 2v12l-4.5-3.5H1z" fill="currentColor" stroke="none" />
                {muted ? <path d="M13 5.5l5 5M18 5.5l-5 5" strokeLinecap="round" /> : <path d="M12.5 5a4 4 0 0 1 0 6M15 2.5a7.5 7.5 0 0 1 0 11" strokeLinecap="round" />}
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close showreel"
            // Phones: top-right (Studio Size), clear of the centred controls; desktop: bottom-right.
            className={`${circle} pointer-events-auto absolute right-gutter top-[max(20px,calc(var(--bar)/2_-_var(--circle)/2))] md:top-auto md:bottom-[max(20px,calc(var(--bar)/2_-_var(--circle)/2))]`}
            onPointerEnter={() => setIdle(false)}
          >
            <span className={overlay} />
            <svg
              viewBox="0 0 14 14"
              className="relative size-3.5 transition-transform duration-300 ease-ui group-hover/btn:rotate-90"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Letterbox geometry for the current window (reel is wider than most screens). */
function geometry() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ratio = media.showreel.width / media.showreel.height;
  const bandH = Math.min(vh, vw / ratio);
  return { vw, vh, bandH, bar: Math.max(0, (vh - bandH) / 2) };
}
