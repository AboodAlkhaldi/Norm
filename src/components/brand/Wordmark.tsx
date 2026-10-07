"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { onEnterView } from "@/lib/onEnterView";
import { WORDMARK_BANDS, WORDMARK_DOT, WORDMARK_PATH, WORDMARK_VIEWBOX } from "./logo-geometry";

/**
 * Giant footer wordmark with the reveal from MOTION.md §12: letters rise from a
 * mask one by one, then the red dot appears. At rest the unclipped logo is shown
 * (no seams between letter bands).
 */
export function Wordmark({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const { width, height } = WORDMARK_VIEWBOX;

  useGSAP(
    () => {
      if (reduced) return;
      const svg = root.current!;
      const full = svg.querySelector("[data-full]");
      const bands = svg.querySelectorAll("[data-band]");
      const dot = svg.querySelector("[data-dot]");
      gsap.set(full, { autoAlpha: 0 });
      gsap.set(bands, { yPercent: 105 });
      gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          gsap.set(full, { autoAlpha: 1 });
          gsap.set(svg.querySelector("[data-bands]"), { display: "none" });
        },
      });
      tl.to(bands, { yPercent: 0, duration: 1.2, ease: "page", stagger: 0.07 }).to(
        dot,
        { scale: 1, duration: 0.6, ease: "page" },
        "-=0.45",
      );
      return onEnterView(svg, () => tl.play(), "0px 0px -8% 0px");
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <svg
      ref={root}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="NORM"
      xmlns="http://www.w3.org/2000/svg"
      overflow="hidden"
    >
      <defs>
        {WORDMARK_BANDS.map(([x0, x1], i) => (
          <clipPath id={`wm-band-${i}`} key={i}>
            <rect x={x0 - 0.5} y={0} width={x1 - x0 + 1} height={height} />
          </clipPath>
        ))}
      </defs>
      <g data-full>
        <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
      </g>
      <g data-bands aria-hidden="true">
        {WORDMARK_BANDS.map((_, i) => (
          <g key={i} clipPath={`url(#wm-band-${i})`}>
            <path data-band d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
          </g>
        ))}
      </g>
      <circle data-dot cx={WORDMARK_DOT.cx} cy={WORDMARK_DOT.cy} r={WORDMARK_DOT.r} fill="var(--c-accent)" />
    </svg>
  );
}
