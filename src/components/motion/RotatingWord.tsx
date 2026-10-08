"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { afterIntro } from "@/lib/intro";

/**
 * Rotating word (MOTION.md §2). Behaviour from the AI site — the word's letters
 * flip up and out while the next word's letters rise in — built the way Studio
 * Size does it (GSAP timeline, chars y ±150%, power4.out, 0.05s stagger).
 * With a single word, two copies of it alternate, exactly like the AI site.
 */
export function RotatingWord({
  words,
  // Seconds a word stays before flipping (owner: faster than Studio Size's ~5.4 s cycle).
  hold = 3.5,
  startDelay = 1.6,
}: {
  words: readonly string[];
  hold?: number;
  startDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const list = words.length === 1 ? [words[0], words[0]] : words;

  useGSAP(
    () => {
      if (reduced) return;
      const groups = gsap.utils.toArray<HTMLElement>("[data-word]", ref.current).map((w) =>
        Array.from(w.querySelectorAll<HTMLElement>("[data-char]")),
      );
      groups.slice(1).forEach((chars) => gsap.set(chars, { yPercent: 150 }));

      const tl = gsap.timeline({ repeat: -1, delay: startDelay, paused: true });
      groups.forEach((chars, i) => {
        const next = groups[(i + 1) % groups.length];
        tl.to(chars, { yPercent: -150, duration: 0.75, ease: "power4.out", stagger: 0.04 }, `+=${hold}`).fromTo(
          next,
          { yPercent: 150 },
          { yPercent: 0, duration: 0.75, ease: "power4.out", stagger: 0.04, immediateRender: false },
          "<0.12",
        );
      });
      return afterIntro(() => tl.play());
    },
    { scope: ref, dependencies: [reduced, list.join("|")] },
  );

  return (
    <span ref={ref} className="relative inline-grid overflow-clip pb-[0.12em] -mb-[0.12em] align-bottom">
      <span className="sr-only">{words[0]}</span>
      {list.map((word, i) => (
        <span
          key={i}
          data-word=""
          aria-hidden="true"
          className="col-start-1 row-start-1 whitespace-nowrap"
          style={reduced && i > 0 ? { visibility: "hidden" } : undefined}
        >
          {Array.from(word).map((c, j) => (
            <span key={j} data-char="" className="inline-block">
              {c === " " ? " " : c}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
