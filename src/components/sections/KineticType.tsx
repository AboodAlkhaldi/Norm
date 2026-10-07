"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { onEnterView } from "@/lib/onEnterView";

/**
 * Kinetic type tile (Figma "ME / OV"): two oversized lines drift slowly in
 * opposite directions inside a black tile, so only fragments of the letters are
 * visible at any time. Static under reduced motion.
 */
export function KineticType({ lines, className = "" }: { lines: [string, string]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const [top, bottom] = gsap.utils.toArray<HTMLElement>("[data-kinetic]", ref.current);
      const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 7 } });
      tl.fromTo(top, { xPercent: 8 }, { xPercent: -14 }, 0).fromTo(bottom, { xPercent: -10 }, { xPercent: 12 }, 0);
      const stop = onEnterView(ref.current!, () => tl.play(), "0px");
      return () => {
        stop();
        tl.kill();
      };
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`relative size-full overflow-hidden bg-[#050505] font-normal leading-none tracking-[-0.02em] text-fg ${className}`}
    >
      <span data-kinetic="" className="absolute right-[-6%] top-[4%] block whitespace-nowrap text-[clamp(64px,calc(170*var(--u)),220px)]">
        {lines[0]}
      </span>
      <span data-kinetic="" className="absolute bottom-[4%] left-[-6%] block whitespace-nowrap text-[clamp(64px,calc(170*var(--u)),220px)]">
        {lines[1]}
      </span>
    </div>
  );
}
