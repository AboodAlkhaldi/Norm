"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
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

const FPS = 25;
const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
/** HH:MM:SS:FF */
const timecode = (s: number) => `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad((s % 1) * FPS)}`;
const short = (s: number) => `${pad(s / 60)}:${pad(s % 60)}`;

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

/** Copy the frame currently showing in `from`'s video onto the canvas (the preview "becomes" the film). */
function captureFrame(from: HTMLElement | null, canvas: HTMLCanvasElement | null) {
  const v = from?.querySelector("video");
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

/**
 * Showreel — opening "Letterbox" + player "Viewfinder" (owner's choice, MOTION.md §15):
 * the hero box widens to full screen, then cinema bars slide in from the top and
 * bottom while the picture settles into the reel's wide format. The bars carry a
 * camera-viewfinder UI: corner brackets, blinking REC dot, frame timecode, a red
 * scrubbable timeline and text controls. Closing plays the same timeline backwards
 * and returns to the exact scroll position.
 */
function ShowreelOverlay({ isOpen, onClose, origin }: { isOpen: boolean; onClose: () => void; origin: HTMLElement | null }) {
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLCanvasElement>(null);
  const barTop = useRef<HTMLDivElement>(null);
  const barBottom = useRef<HTMLDivElement>(null);
  const ui = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const savedScroll = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const originRef = useRef(origin);
  useEffect(() => {
    originRef.current = origin;
  }, [origin]);

  const [src] = useState(chooseSource);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  useFocusTrap(root, isOpen);

  // Open / close.
  useEffect(() => {
    const el = root.current!;
    const v = video.current;
    const instant = prefersReducedMotion();

    if (isOpen) {
      // Re-opened while the close was still running: just play forward again.
      if (tl.current && tl.current.reversed()) {
        tl.current.timeScale(1).play();
        v?.play().catch(() => {});
        return;
      }
      opener.current = document.activeElement as HTMLElement | null;
      savedScroll.current = window.scrollY;
      lockScroll(true);
      const g = geometry();
      el.style.setProperty("--bar", `${g.bar}px`);
      gsap.set(el, { display: "block", visibility: "visible", opacity: 1 });
      const hasFrame = captureFrame(originRef.current, frame.current);
      gsap.set(frame.current, { opacity: hasFrame ? 1 : 0 });
      const r = instant ? null : (originRef.current?.getBoundingClientRect() ?? null);
      const onScreen = !!r && r.width > 0 && r.bottom > 0 && r.top < g.vh;

      const t = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          gsap.set(el, { display: "none", visibility: "hidden" });
          tl.current = null;
          video.current?.pause();
          lockScroll(false);
          // Land exactly where the visitor was.
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(savedScroll.current, { immediate: true, force: true });
          else window.scrollTo(0, savedScroll.current);
          opener.current?.focus?.({ preventScroll: true });
        },
      });
      if (onScreen && r) {
        t.fromTo(
          box.current,
          { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 4 },
          { left: 0, top: 0, width: g.vw, height: g.vh, borderRadius: 0, duration: 0.95, ease: "page" },
        )
          .fromTo([barTop.current, barBottom.current], { height: 0 }, { height: g.bar, duration: 0.65, ease: "page" }, 0.7)
          .to(box.current, { top: g.bar, height: g.bandH, duration: 0.65, ease: "page" }, 0.7)
          .to(frame.current, { opacity: 0, duration: 0.5, ease: "ui" }, 0.85)
          .fromTo(ui.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "ui" }, 1.15);
      } else {
        gsap.set(box.current, { left: 0, top: g.bar, width: g.vw, height: g.bandH, borderRadius: 0 });
        gsap.set([barTop.current, barBottom.current], { height: g.bar });
        gsap.set(frame.current, { opacity: 0 });
        t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: instant ? 0 : 0.5, ease: "page" }).fromTo(
          ui.current,
          { opacity: 0 },
          { opacity: 1, duration: instant ? 0 : 0.4, ease: "ui" },
          instant ? 0 : 0.2,
        );
      }
      tl.current = t;
      t.play();
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => setPaused(true));
      }
      setPaused(false);
      el.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus({ preventScroll: true });
    } else if (tl.current) {
      // Close = the opening, backwards (a little quicker).
      tl.current.timeScale(1.35).reverse();
    }
  }, [isOpen]);

  // Keep the letterbox right if the window is resized while open.
  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => {
      const g = geometry();
      root.current?.style.setProperty("--bar", `${g.bar}px`);
      if (tl.current && tl.current.progress() < 1) return;
      gsap.set(box.current, { left: 0, top: g.bar, width: g.vw, height: g.bandH });
      gsap.set([barTop.current, barBottom.current], { height: g.bar });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen]);

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

  // Keyboard: Esc closes, Space pauses, M mutes, ←/→ skip 5 s.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const onButton = !!target?.closest("button");
      const onSlider = !!target?.closest("[role=slider]");
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

  const scrubTo = (clientX: number, el: HTMLElement) => {
    const v = video.current;
    if (!v || !v.duration) return;
    const r = el.getBoundingClientRect();
    v.currentTime = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * v.duration;
    setTime(v.currentTime);
  };

  const progress = duration ? (time / duration) * 100 : 0;
  const bracket = "pointer-events-none absolute size-[clamp(14px,calc(22*var(--u)),28px)] border-white/55";
  const side = "clamp(16px,calc(43*var(--u)),56px)";

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="NORM showreel"
      className="fixed inset-0 z-[80]"
      style={{ display: "none", visibility: "hidden" }}
      data-lenis-prevent=""
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
            if (!scrubbing) setTime(e.currentTarget.currentTime);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
        />
        {/* Frame of the hero preview, shown while the box grows, then dissolved into the reel */}
        <canvas ref={frame} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full object-cover" />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={toggle}
          data-cursor={paused ? "play" : "pause"}
          className="absolute inset-0 cursor-pointer"
        />
      </div>

      {/* Cinema bars */}
      <div ref={barTop} className="absolute inset-x-0 top-0 bg-bg" style={{ height: 0 }} />
      <div ref={barBottom} className="absolute inset-x-0 bottom-0 bg-bg" style={{ height: 0 }} />

      {/* Viewfinder UI */}
      <div ref={ui} className="pointer-events-none absolute inset-0 text-fg" style={{ opacity: 0 }}>
        <span className={`${bracket} border-l border-t`} style={{ left: side, top: "calc(var(--bar) + 16px)" }} />
        <span className={`${bracket} border-r border-t`} style={{ right: side, top: "calc(var(--bar) + 16px)" }} />
        <span className={`${bracket} border-b border-l`} style={{ left: side, bottom: "calc(var(--bar) + 16px)" }} />
        <span className={`${bracket} border-b border-r`} style={{ right: side, bottom: "calc(var(--bar) + 16px)" }} />

        <div className="absolute flex items-center gap-6 text-ui" style={{ left: side, right: side, top: "max(16px, calc(var(--bar) / 2 - 14px))" }}>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${buffering ? "bg-muted" : "bg-accent"} ${paused || buffering ? "" : "animate-[rec_1.2s_steps(2)_infinite]"}`}
            />
            <span className="tabular-nums tracking-[0.04em]" aria-label={`Time ${short(time)} of ${short(duration)}`}>
              {timecode(time)}
            </span>
            {buffering && <span className="text-muted">Loading…</span>}
          </div>
          <div className="pointer-events-auto ml-auto flex items-center gap-[clamp(16px,calc(28*var(--u)),36px)]">
            <TextControl onClick={toggle} data-autofocus="">
              {paused ? "Play" : "Pause"}
            </TextControl>
            <TextControl onClick={toggleSound} aria-pressed={!muted} title={media.showreel.hasAudio ? undefined : "This placeholder reel has no audio track"}>
              {muted ? "Sound off" : "Sound on"}
            </TextControl>
            <TextControl onClick={onClose}>Close</TextControl>
          </div>
        </div>

        <div
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
            e.currentTarget.setPointerCapture(e.pointerId);
            setScrubbing(true);
            scrubTo(e.clientX, e.currentTarget);
          }}
          onPointerMove={(e) => {
            if (scrubbing) scrubTo(e.clientX, e.currentTarget);
          }}
          onPointerUp={() => setScrubbing(false)}
          className="group pointer-events-auto absolute h-4 cursor-pointer"
          style={{ left: side, right: side, bottom: "max(10px, calc(var(--bar) / 2 - 8px))" }}
        >
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong transition-[height] duration-200 group-hover:h-[3px]" />
          <span
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-accent transition-[height] duration-200 group-hover:h-[3px]"
            style={{ width: `${progress}%` }}
          />
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

/** Text control with the nav's underline (in from the left, out to the right). */
function TextControl(props: ComponentProps<"button">) {
  return (
    <button type="button" {...props} className="group relative py-1 text-ui text-fg">
      {props.children}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-px origin-right scale-x-0 bg-fg transition-transform duration-300 ease-ui group-hover:origin-left group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </button>
  );
}
