"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * Floating page scrollbar (owner's request; Studio Size also replaces the browser
 * scrollbar with its own). The native scrollbar is hidden in globals.css. This thin
 * bar on the right edge fades in while the page scrolls and fades out ~1 s after it
 * stops; it also shows when the pointer nears the right edge, and can be dragged
 * (or the track clicked) to scroll. Desktop pointers only — touch devices already
 * use overlay scrollbars. Decorative for assistive tech (keyboard scrolling is native).
 */
export function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false); // visible
  const [grab, setGrab] = useState(false); // hovered or dragging (thicker)

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const r = rail.current!;
    const t = thumb.current!;
    let raf = 0;
    let hide: number | undefined;
    let hovering = false;
    let dragging = false;
    let dragStartY = 0;
    let dragStartScroll = 0;

    const metrics = () => {
      const vh = window.innerHeight;
      const doc = document.documentElement.scrollHeight;
      const max = Math.max(0, doc - vh);
      const h = max > 0 ? Math.max(48, (vh * vh) / doc) : 0;
      return { vh, max, h };
    };
    const paint = () => {
      raf = 0;
      const { vh, max, h } = metrics();
      r.style.visibility = max > 0 ? "visible" : "hidden";
      t.style.height = `${h}px`;
      t.style.transform = `translate3d(0, ${max ? (window.scrollY / max) * (vh - h) : 0}px, 0)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const show = () => {
      setActive(true);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => {
        if (!hovering && !dragging) setActive(false);
      }, 1000);
    };
    const onScroll = () => {
      schedule();
      // Stay hidden while an overlay / the intro locks the page, and during page
      // transitions (smooth scroll is paused then and the jump to the top isn't the visitor's).
      const html = document.documentElement;
      if (html.style.overflow !== "hidden" && !html.dataset.intro && !html.classList.contains("lenis-stopped")) show();
    };
    const scrollTo = (y: number, immediate: boolean) => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { immediate });
      else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
    };

    // Pointer near the right edge shows the rail so it can be grabbed.
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        const { vh, max, h } = metrics();
        const ratio = max / Math.max(1, vh - h);
        scrollTo(dragStartScroll + (e.clientY - dragStartY) * ratio, true);
        return;
      }
      const near = window.innerWidth - e.clientX < 18;
      if (near !== hovering) {
        hovering = near;
        setGrab(near);
        if (near) {
          setActive(true);
          window.clearTimeout(hide);
        } else show();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const tr = t.getBoundingClientRect();
      if (e.target === t || (e.clientY >= tr.top && e.clientY <= tr.bottom)) {
        dragging = true;
        dragStartY = e.clientY;
        dragStartScroll = window.scrollY;
        r.setPointerCapture(e.pointerId);
        setGrab(true);
      } else {
        // Click on the track: jump there (smooth).
        const { vh, max, h } = metrics();
        scrollTo(((e.clientY - h / 2) / Math.max(1, vh - h)) * max, false);
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (r.hasPointerCapture(e.pointerId)) r.releasePointerCapture(e.pointerId);
      setGrab(hovering);
      show();
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pointermove", onMove, { passive: true });
    r.addEventListener("pointerdown", onDown);
    r.addEventListener("pointerup", onUp);
    r.addEventListener("pointercancel", onUp);
    paint();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onMove);
      r.removeEventListener("pointerdown", onDown);
      r.removeEventListener("pointerup", onUp);
      r.removeEventListener("pointercancel", onUp);
      window.clearTimeout(hide);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rail}
      aria-hidden="true"
      data-scroll-rail=""
      // mix-blend-difference keeps the thumb visible over both black sections and bright media.
      className={`fixed bottom-0 right-0 top-0 z-[60] w-4 mix-blend-difference transition-opacity duration-500 ease-ui ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        ref={thumb}
        className={`absolute right-1 top-0 rounded-full transition-[width,background-color] duration-300 ease-ui ${grab ? "w-1.5 bg-white/90" : "w-[3px] bg-white/60"}`}
      />
    </div>
  );
}
