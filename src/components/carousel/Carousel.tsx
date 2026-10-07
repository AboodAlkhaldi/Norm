"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

export type CarouselApi = {
  prev: () => void;
  next: () => void;
  canPrev: boolean;
  canNext: boolean;
};

const CarouselContext = createContext<CarouselApi>({ prev: () => {}, next: () => {}, canPrev: false, canNext: false });
/** Read the carousel controls from inside its `header` / `footer`. */
export const useCarousel = () => useContext(CarouselContext);

/**
 * Horizontal carousel (MOTION.md §8): pointer drag with momentum + snap to items,
 * prev/next arrows (placed by the parent in `header` / `footer`, see CarouselArrows), keyboard ←/→,
 * focus follows. The track bleeds to the right edge of the viewport like Figma.
 * Drag affordance (owner's choice): the outline ‹ › cursor over the track (CursorLabel).
 */
export function Carousel({
  children,
  header,
  footer,
  className = "",
  trackClassName = "",
  label,
}: {
  children: ReactNode;
  /** Rendered above the track (e.g. title + arrows). */
  header?: ReactNode;
  /** Rendered below the track (e.g. arrows + text on the Home image strip). */
  footer?: ReactNode;
  className?: string;
  trackClassName?: string;
  label: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const index = useRef(0);
  const [state, setState] = useState({ canPrev: false, canNext: true });

  // Returns null once the carousel is no longer in the page (e.g. a resize/tween callback
  // arriving after navigation) — every caller bails out in that case.
  const metrics = useCallback(() => {
    const v = viewport.current;
    const t = track.current;
    if (!v || !t || !t.isConnected) return null;
    const items = Array.from(t.children) as HTMLElement[];
    const style = getComputedStyle(v);
    const padL = parseFloat(style.paddingLeft) || 0;
    const max = Math.max(0, t.scrollWidth - (v.clientWidth - padL));
    const stops = items.map((el) => Math.min(el.offsetLeft, max));
    // Remove duplicate trailing stops (all clamped to max).
    const unique = stops.filter((s, i) => i === 0 || s > stops[i - 1] + 1);
    return { max, stops: unique };
  }, []);

  const update = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const { max } = m;
    setState({ canPrev: x.current < -1, canNext: -x.current < max - 1 });
  }, [metrics]);

  const goTo = useCallback(
    (i: number) => {
      const m = metrics();
      if (!m) return;
      const { stops } = m;
      index.current = Math.max(0, Math.min(stops.length - 1, i));
      x.current = -stops[index.current];
      gsap.to(track.current, {
        x: x.current,
        duration: prefersReducedMotion() ? 0 : 0.8,
        ease: "page",
        overwrite: true,
        onComplete: update,
      });
      update();
    },
    [metrics, update],
  );

  const nearest = useCallback(
    (pos: number) => {
      const m = metrics();
      if (!m) return index.current;
      const { stops } = m;
      let best = 0;
      stops.forEach((s, i) => {
        if (Math.abs(-pos - s) < Math.abs(-pos - stops[best])) best = i;
      });
      return best;
    },
    [metrics],
  );

  // Drag
  useEffect(() => {
    const v = viewport.current!;
    let startX = 0;
    let startPos = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let dragging = false;
    let moved = false;

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startPos = x.current;
      velocity = 0;
      gsap.killTweensOf(track.current);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        v.setPointerCapture(e.pointerId);
        v.dataset.dragging = "true";
      }
      if (!moved) return;
      const now = performance.now();
      velocity = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      const m = metrics();
      if (!m) return;
      const { max } = m;
      let next = startPos + dx;
      if (next > 0) next *= 0.35; // resistance past the ends
      if (next < -max) next = -max + (next + max) * 0.35;
      x.current = next;
      gsap.set(track.current, { x: next });
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (v.hasPointerCapture(e.pointerId)) v.releasePointerCapture(e.pointerId);
      if (!moved) return;
      const projected = x.current + velocity * 260;
      goTo(nearest(projected));
      window.setTimeout(() => delete v.dataset.dragging, 0);
    };
    // Swallow the click that ends a drag so cards don't open.
    const click = (e: MouseEvent) => {
      if (v.dataset.dragging === "true" || moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    v.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    v.addEventListener("click", click, true);
    return () => {
      v.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      v.removeEventListener("click", click, true);
    };
  }, [goTo, metrics, nearest]);

  // Resize → re-clamp. Stop tweens when the carousel leaves the page.
  useEffect(() => {
    const el = viewport.current;
    const t = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => goTo(index.current));
    ro.observe(el);
    return () => {
      ro.disconnect();
      gsap.killTweensOf(t);
    };
  }, [goTo]);

  const prev = useCallback(() => goTo(index.current - 1), [goTo]);
  const next = useCallback(() => goTo(index.current + 1), [goTo]);
  const api = useMemo(() => ({ prev, next, ...state }), [prev, next, state]);

  return (
    <CarouselContext.Provider value={api}>
    <div className={className}>
      {header}
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        data-cursor="drag"
        data-reveal-root=""
        className="cursor-grab touch-pan-y select-none overflow-hidden pl-gutter active:cursor-grabbing"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") next();
          if (e.key === "ArrowLeft") prev();
        }}
        onFocus={(e) => {
          // Bring a keyboard-focused card into view (not on mouse clicks / drags).
          if (!(e.target as HTMLElement).matches(":focus-visible")) return;
          const items = Array.from(track.current!.children);
          const i = items.findIndex((el) => el.contains(e.target as Node));
          if (i >= 0) {
            viewport.current!.scrollLeft = 0;
            goTo(nearest(-(items[i] as HTMLElement).offsetLeft));
          }
        }}
      >
        <div ref={track} className={`relative flex w-max gap-gap will-change-transform ${trackClassName}`} onDragStart={(e) => e.preventDefault()}>
          {children}
        </div>
      </div>
      {footer}
    </div>
    </CarouselContext.Provider>
  );
}
