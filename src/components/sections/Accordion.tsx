"use client";

import { useId, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/**
 * Accordion (MOTION.md §14): one item open at a time, first open by default,
 * height animated, "+" turns into "×".
 */
export function Accordion({ items }: { items: { title: string; body: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const root = useRef<HTMLUListElement>(null);
  const id = useId();

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root.current);
      panels.forEach((p, i) => {
        const isOpen = i === open;
        gsap.to(p, {
          height: isOpen ? "auto" : 0,
          duration: prefersReducedMotion() ? 0 : 0.6,
          ease: "page",
          overwrite: true,
        });
      });
    },
    { dependencies: [open], scope: root },
  );

  return (
    <ul ref={root} className="border-b border-line">
      {items.map((item, i) => {
        const isOpen = i === open;
        return (
          <li key={item.title} className="border-t border-line">
            <h3>
              <button
                type="button"
                id={`${id}-h-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-[clamp(20px,calc(37*var(--u)),48px)] text-left text-card font-normal"
              >
                {item.title}
                <span
                  aria-hidden="true"
                  className="grid size-circle shrink-0 place-items-center rounded-full border-2 border-pill transition-colors duration-300 ease-ui group-hover:border-fg"
                >
                  <svg viewBox="0 0 12 12" className={`size-3 transition-transform duration-300 ease-ui ${isOpen ? "rotate-45" : ""}`}>
                    <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`${id}-p-${i}`}
              role="region"
              aria-labelledby={`${id}-h-${i}`}
              data-panel=""
              className="overflow-hidden"
              style={{ height: i === 0 ? "auto" : 0 }}
            >
              <p className="max-w-[calc(700*var(--u))] pb-[clamp(24px,calc(40*var(--u)),56px)] text-lead text-fg/80 max-md:max-w-none">{item.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
