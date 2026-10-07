"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/** Values of data-cursor that render an icon (centred on the pointer, native cursor hidden). */
const ICONS = ["drag", "play", "pause"] as const;
type Icon = (typeof ICONS)[number];
const isIcon = (v: string | null): v is Icon => !!v && (ICONS as readonly string[]).includes(v);

/**
 * Studio Size's "mouse frame", in the owner's chosen outline style — behaves like the
 * approved mockup: the cursor element always sits exactly on the pointer, and the
 * switch between the normal cursor and the icon is a 0.3 s scale + fade (0.5 ↔ 1).
 * Elements opt in with `data-cursor`:
 * - "drag" | "play" | "pause" → outline circle with an icon on the pointer (native cursor
 *   hidden there via CSS) — carousels, the showreel picture;
 * - any other text → a small outline label just below-right of the pointer ("Copy").
 * Desktop pointers only; off under reduced motion. Flash a label after an action with
 * `window.dispatchEvent(new CustomEvent("norm:cursor", { detail: "Copied" }))`.
 */
export function CursorLabel() {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<string | null>(null);
  // What is drawn: keeps the last value while fading out, so the circle leaves as a circle.
  const [shown, setShown] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    document.documentElement.classList.add("has-cursor-label");
    let current: string | null = null;
    let flash: number | undefined;
    let flashing = false;
    let raf = 0;
    let px = -100;
    let py = -100;

    const set = (v: string | null) => {
      if (v === current) return;
      current = v;
      setValue(v);
      if (v) setShown(v);
    };
    const read = (target: EventTarget | null) => (target as Element | null)?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? null;
    const paint = () => {
      raf = 0;
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
      if (!flashing) set(read(e.target));
    };
    // Scrolling moves the page under a still pointer — re-check what is under it each frame.
    let scrollRaf = 0;
    const recheck = () => {
      scrollRaf = 0;
      if (flashing || px < 0) return;
      set(read(document.elementFromPoint(px, py)));
    };
    const onScroll = () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(recheck);
    };
    const down = () => gsap.to(inner.current, { scale: 0.82, duration: 0.2, ease: "ui" });
    const up = () => gsap.to(inner.current, { scale: 1, duration: 0.3, ease: "ui" });
    const onFlash = (e: Event) => {
      flashing = true;
      set((e as CustomEvent<string>).detail);
      window.clearTimeout(flash);
      flash = window.setTimeout(() => {
        flashing = false;
        set(null);
      }, 1200);
    };
    const leave = () => set(null);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("norm:cursor", onFlash);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor-label");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("norm:cursor", onFlash);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.clearTimeout(flash);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
    };
  }, [enabled]);

  if (!enabled) return null;

  const icon = isIcon(shown);
  const visible = value !== null;
  return (
    <div ref={ref} aria-hidden="true" data-cursor-label="" className="pointer-events-none fixed left-0 top-0 z-[95]" style={{ transform: "translate3d(-100px,-100px,0)" }}>
      <span
        ref={inner}
        className={`flex items-center justify-center whitespace-nowrap rounded-full border border-fg/60 text-fg transition-[opacity,scale] duration-300 ease-ui ${
          visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
        } ${icon ? "-ml-[29px] -mt-[29px] size-[58px] gap-1.5" : "ml-[18px] mt-[18px] h-9 px-4 text-ui"}`}
      >
        {shown === "drag" && (
          <>
            <Chevron dir="left" />
            <Chevron dir="right" />
          </>
        )}
        {shown === "play" && (
          <svg viewBox="0 0 12 14" className="ml-0.5 size-3.5" aria-hidden="true">
            <path d="M0 0l12 7-12 7z" fill="currentColor" />
          </svg>
        )}
        {shown === "pause" && (
          <svg viewBox="0 0 12 14" className="size-3.5" aria-hidden="true">
            <path d="M1 0h3v14H1zM8 0h3v14H8z" fill="currentColor" />
          </svg>
        )}
        {!icon && shown}
      </span>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 8 14" className={`h-3.5 w-2 ${dir === "left" ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M7 1L1 7l6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
