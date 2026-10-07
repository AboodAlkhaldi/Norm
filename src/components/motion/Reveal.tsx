"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { onEnterView } from "@/lib/onEnterView";
import { afterIntro } from "@/lib/intro";

type Base = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Extra delay (s). */
  delay?: number;
  /** Play on mount instead of on scroll (above-the-fold content). */
  immediate?: boolean;
};

/*
 * Reveals play once when the element is 12% into the viewport ("top 88%" in
 * ScrollTrigger terms, MOTION.md §3–5). They use a native IntersectionObserver
 * rather than one ScrollTrigger each: lighter, and robust when the browser
 * restores a scroll position on reload.
 */

/**
 * Line reveal (MOTION.md §3): text is split into masked lines that rise into place.
 * Re-splits automatically on resize / font load.
 */
export function RevealLines({ children, className = "", as: Tag = "div", delay = 0, immediate = false }: Base) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      let entered = false;
      let tween: gsap.core.Tween | null = null;
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "reveal-line",
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          tween = gsap.fromTo(
            self.lines,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 0.9,
              ease: "page",
              stagger: 0.09,
              delay: immediate ? 0.35 + delay : delay,
              paused: !entered,
            },
          );
          return tween;
        },
      });
      const start = () => {
        entered = true;
        tween?.play();
      };
      // Above the fold: wait for the intro (if any) to hand over.
      return immediate ? afterIntro(start) : onEnterView(el, start);
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}

/**
 * Fade-up reveal (MOTION.md §4). With `stagger`, direct children animate one after another.
 */
export function Reveal({ children, className = "", as: Tag = "div", delay = 0, immediate = false, stagger }: Base & { stagger?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.set(el, { visibility: "visible" });
      if (reduced) return;
      const targets = stagger ? Array.from(el.children) : el;
      const tween = gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "page",
          stagger: stagger ?? 0,
          delay: immediate ? 0.45 + delay : delay,
          clearProps: "transform",
          paused: true,
        },
      );
      return immediate ? afterIntro(() => tween.play()) : onEnterView(el, () => tween.play());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}

/**
 * Media reveal (MOTION.md §5): a black curtain lifts off the media while it settles from 1.08 to 1.
 * Put it on a sized element; children fill it.
 */
export function MediaReveal({
  children,
  className = "",
  delay = 0,
  immediate = false,
  style,
}: Omit<Base, "as"> & { style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      const curtain = el.querySelector("[data-curtain]");
      const inner = el.querySelector("[data-inner]");
      const tl = gsap.timeline({ delay: immediate ? 0.4 + delay : delay, paused: true });
      tl.fromTo(curtain, { scaleY: 1 }, { scaleY: 0, duration: 0.9, ease: "page", transformOrigin: "50% 0%" }).fromTo(
        inner,
        { scale: 1.08 },
        { scale: 1, duration: 1.4, ease: "page", clearProps: "transform" },
        0,
      );
      return immediate ? afterIntro(() => tl.play()) : onEnterView(el, () => tl.play(), "0px 0px -10% 0px");
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={style}>
      <div data-inner className="size-full">
        {children}
      </div>
      {!reduced && <div data-curtain aria-hidden="true" className="pointer-events-none absolute inset-0 origin-top bg-bg" />}
    </div>
  );
}

/**
 * Single-line rise (MOTION.md §3) for short items such as list rows: the content
 * rises from a mask without being split, so nested markup stays intact.
 */
export function RiseIn({ children, className = "", delay = 0, immediate = false }: Omit<Base, "as">) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.set(el, { visibility: "visible" });
      if (reduced) return;
      const tween = gsap.fromTo(
        el.firstElementChild,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: "page", delay: immediate ? 0.35 + delay : delay, paused: true },
      );
      return immediate ? afterIntro(() => tween.play()) : onEnterView(el, () => tween.play());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <span ref={ref} data-reveal="" className={`mask-line ${className}`}>
      <span className="block">{children}</span>
    </span>
  );
}
