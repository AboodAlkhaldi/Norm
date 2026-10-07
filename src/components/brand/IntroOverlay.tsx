"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { INTRO_STORAGE_KEY, releaseIntro } from "@/lib/intro";
import { WORDMARK_BANDS, WORDMARK_DOT, WORDMARK_PATH, WORDMARK_VIEWBOX } from "./logo-geometry";

/**
 * Intro (owner's choice, MOTION.md §18): on the first visit of a session the NORM
 * wordmark builds part by part on black, the red dot blinks once like a camera's
 * REC light, then the logo flies into the header's logo spot while the black
 * screen lifts away and the hero rises underneath. ≈1.9 s; any click, key, wheel
 * or touch skips it. Shown/hidden by CSS on html[data-intro="playing"], which an
 * inline script sets before first paint (so nothing flashes underneath).
 */
export function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const { width, height } = WORDMARK_VIEWBOX;

  useGSAP(
    () => {
      const html = document.documentElement;
      if (html.dataset.intro !== "playing") return;
      const el = root.current!;
      const cover = el.querySelector("[data-cover]");
      const logo = el.querySelector<HTMLElement>("[data-logo]")!;
      const svg = el.querySelector("svg")!;
      const bands = el.querySelectorAll("[data-band]");
      const dot = el.querySelector("[data-dot]");
      getLenis()?.stop();

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        releaseIntro();
        try {
          sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
        } catch {
          /* storage blocked — the intro may show again next load, that's fine */
        }
        delete html.dataset.intro; // CSS hides the overlay and shows the header logo
        getLenis()?.start();
        ScrollTrigger.refresh();
        removeSkip();
      };

      gsap.set(svg, { visibility: "visible" });
      gsap.set(bands, { yPercent: 105 });
      gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({ onComplete: finish });
      tl.to(bands, { yPercent: 0, duration: 0.75, ease: "page", stagger: 0.06 }, 0.1)
        .to(dot, { scale: 1, duration: 0.3, ease: "page" }, 0.65)
        // REC blink
        .to(dot, { opacity: 0.15, duration: 0.12, repeat: 1, yoyo: true, ease: "none" }, 0.98)
        .addLabel("fly", 1.25)
        .call(releaseIntro, [], "fly")
        .to(cover, { yPercent: -100, duration: 0.9, ease: "page" }, "fly");

      // Fly the logo into the header logo's exact box.
      const target = document.querySelector('header a[aria-label="NORM — home"] svg');
      if (target) {
        tl.add(() => {
          const from = logo.getBoundingClientRect();
          const to = target.getBoundingClientRect();
          gsap.to(logo, {
            x: to.left - from.left,
            y: to.top - from.top,
            scale: to.width / from.width,
            transformOrigin: "0 0",
            duration: 0.8,
            ease: "page",
          });
        }, "fly");
      } else {
        tl.to(logo, { opacity: 0, duration: 0.4 }, "fly");
      }
      tl.to({}, { duration: 0.9 }, "fly"); // keep the timeline running until the flight lands

      // Any interaction skips straight to the page.
      const skip = () => {
        tl.progress(1);
        finish();
      };
      const opts = { once: true, passive: true } as const;
      const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
      events.forEach((ev) => window.addEventListener(ev, skip, opts));
      const removeSkip = () => events.forEach((ev) => window.removeEventListener(ev, skip));
      return removeSkip;
    },
    { scope: root },
  );

  return (
    <div ref={root} id="intro" aria-hidden="true">
      <div data-cover className="absolute inset-0 bg-bg" />
      <div className="absolute inset-0 grid place-items-center">
        <div data-logo className="w-[min(440px,62vw)]">
          <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full text-fg" style={{ visibility: "hidden" }} overflow="hidden">
            <defs>
              {WORDMARK_BANDS.map(([x0, x1], i) => (
                <clipPath id={`intro-band-${i}`} key={i}>
                  <rect x={x0 - 0.5} y={0} width={x1 - x0 + 1} height={height} />
                </clipPath>
              ))}
            </defs>
            {WORDMARK_BANDS.map((_, i) => (
              <g key={i} clipPath={`url(#intro-band-${i})`}>
                <path data-band d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
              </g>
            ))}
            <circle data-dot cx={WORDMARK_DOT.cx} cy={WORDMARK_DOT.cy} r={WORDMARK_DOT.r} fill="var(--c-accent)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
