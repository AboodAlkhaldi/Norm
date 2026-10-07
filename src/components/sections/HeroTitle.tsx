"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { RotatingWord } from "@/components/motion/RotatingWord";
import { afterIntro } from "@/lib/intro";

/**
 * Display heading whose lines rise from masks on load (MOTION.md §3).
 * If `rotatingWords` is set, the last line ends with the rotating word.
 */
export function HeroTitle({
  lines,
  rotatingWords,
  as: Tag = "h1",
  className = "",
}: {
  lines: readonly string[];
  rotatingWords?: readonly string[];
  as?: "h1" | "h2";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current!;
      gsap.set(el, { visibility: "visible" });
      if (reduced) return;
      const tween = gsap.fromTo(
        el.querySelectorAll("[data-line]"),
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: "page", stagger: 0.09, delay: 0.35, paused: true },
      );
      // Waits for the intro (first visit) to hand over.
      return afterIntro(() => tween.play());
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} data-reveal="" className={`text-display ${className}`}>
      {lines.map((line, i) => {
        const last = i === lines.length - 1;
        return (
          <span key={i} className="mask-line">
            <span data-line="" className="block">
              {line}
              {last && rotatingWords && (
                <>
                  {" "}
                  <RotatingWord words={rotatingWords} />
                </>
              )}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
