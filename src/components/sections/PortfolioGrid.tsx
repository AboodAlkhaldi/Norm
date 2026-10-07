"use client";

import { useRef, useState } from "react";
import type { PortfolioFilter, Project } from "@/content/types";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "@/components/motion/Reveal";

type FilterId = "all" | PortfolioFilter;

/**
 * Portfolio title row + filter pills + 3-column grid. Filtering follows Studio Size
 * (MOTION.md §9): the grid fades out, the cards swap, the grid height eases to its new
 * size (so the CTA below glides instead of jumping) and the new cards rise in, staggered.
 */
export function PortfolioGrid({
  title,
  projects,
  filters,
}: {
  title: string;
  projects: Project[];
  filters: { id: FilterId; label: string }[];
}) {
  const [active, setActive] = useState<FilterId>("all");
  const grid = useRef<HTMLUListElement>(null);
  const fromHeight = useRef<number | null>(null);
  const switching = useRef(false);

  const matches = (p: Project) => active === "all" || p.filters.includes(active);

  const choose = (id: FilterId) => {
    const el = grid.current;
    if (id === active || switching.current) return;
    if (!el || prefersReducedMotion()) {
      setActive(id);
      return;
    }
    switching.current = true;
    fromHeight.current = el.offsetHeight;
    gsap.to(el, {
      opacity: 0,
      duration: 0.35,
      ease: "ui",
      onComplete: () => setActive(id),
    });
    // Swap even if animation frames are throttled.
    window.setTimeout(() => setActive(id), 450);
  };

  useGSAP(
    () => {
      const el = grid.current;
      const from = fromHeight.current;
      if (!el || from === null) return;
      fromHeight.current = null;
      const to = el.offsetHeight;
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-flip-item]:not(.hidden)"));
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(el, { height: from, overflow: "hidden" }, { height: to, duration: 0.7, ease: "page", clearProps: "height,overflow" });
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "page",
          stagger: 0.07,
          clearProps: "transform",
          onComplete: () => {
            switching.current = false;
          },
        },
      );
      window.setTimeout(() => (switching.current = false), 1600);
    },
    { dependencies: [active], scope: grid },
  );

  const count = projects.filter(matches).length;

  return (
    <section className="px-gutter pt-[clamp(112px,calc(247*var(--u)),320px)]">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <Reveal immediate>
          <h1 className="text-display">{title}</h1>
        </Reveal>
        <Reveal immediate delay={0.1}>
          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-[clamp(8px,calc(16*var(--u)),20px)] md:pb-[calc(10*var(--u))]">
            {filters.map((f) => {
              const on = f.id === active;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(f.id)}
                  className={`inline-flex h-btn items-center rounded-full border-2 px-btn-x text-ui transition-[background-color,color,border-color] duration-300 ease-ui ${
                    on ? "border-fg bg-fg text-bg" : "border-pill text-fg hover:border-fg"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>

      <p className="sr-only" aria-live="polite">
        {count} {count === 1 ? "project" : "projects"} shown
      </p>

      <ul
        ref={grid}
        className="mt-[clamp(32px,calc(66*var(--u)),88px)] grid grid-cols-1 gap-x-gap gap-y-[clamp(40px,calc(64*var(--u)),88px)] sm:grid-cols-2 md:grid-cols-3"
      >
        {projects.map((p) => (
          <li key={p.slug} data-flip-id={p.slug} data-flip-item="" className={matches(p) ? "" : "hidden"}>
            <Reveal>
              <ProjectCard project={p} variant="grid" />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
