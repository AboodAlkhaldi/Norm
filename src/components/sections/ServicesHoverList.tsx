"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Service } from "@/content/types";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/media/Media";

/** Studio Size waits this long on a hovered row before its video starts. */
const PLAY_DELAY = 600;

/**
 * Home services list — Studio Size services_module (MOTION.md §7). Nothing is
 * selected until a row is hovered / focused; that row turns white, slides 80px
 * right and its video fades in beside the list (541 × 406 at 1440), starting after
 * 600 ms. Leaving the list clears the selection again.
 * Touch screens: the row crossing 40% of the screen height is the active one; the
 * picture above the list keeps the last row's frame between rows.
 */
export function ServicesHoverList({ services, eyebrow, className = "" }: { services: Service[]; eyebrow: string; className?: string }) {
  const [active, setActive] = useState<number | null>(null);
  // Phones keep showing the last row's picture (poster) so the box is never empty.
  const [last, setLast] = useState(0);
  if (active !== null && active !== last) setLast(active);
  const [playing, setPlaying] = useState<number | null>(null);
  const [tops, setTops] = useState<number[]>([]);
  const list = useRef<HTMLUListElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();

  // Start the active row's video after the hover delay (immediately on touch).
  useEffect(() => {
    if (active === null) return;
    const t = window.setTimeout(() => setPlaying(active), canHover ? PLAY_DELAY : 0);
    return () => window.clearTimeout(t);
  }, [active, canHover]);
  const live = active !== null && playing === active ? active : null;

  // Desktop: each row's video sits level with its row, below the "Services" label
  // (Studio Size keeps it ≥ 58px down) and inside the list's height.
  useLayoutEffect(() => {
    const ul = list.current;
    const box = media.current;
    if (!ul || !box) return;
    const measure = () => {
      if (!window.matchMedia("(min-width: 768px)").matches) return setTops([]);
      const h = box.offsetHeight;
      const min = Math.round((58 * window.innerWidth) / 1440);
      const max = Math.max(min, ul.offsetHeight - h);
      setTops(
        Array.from(ul.children).map((li) => {
          const el = li as HTMLElement;
          return Math.round(Math.min(max, Math.max(min, el.offsetTop + el.offsetHeight / 2 - h / 2)));
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ul);
    return () => ro.disconnect();
  }, []);

  // Touch: activate the row under the 40% line while scrolling.
  useEffect(() => {
    if (canHover) return;
    const ul = list.current;
    if (!ul) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const i = Number((e.target as HTMLElement).dataset.index);
          if (e.isIntersecting) setActive(i);
          else setActive((a) => (a === i ? null : a));
        });
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    Array.from(ul.children).forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [canHover]);

  return (
    <section className={`relative px-gutter ${className}`} aria-labelledby="home-services">
      {/* No entrance animation: the label and the list are simply there (Studio Size, owner). */}
      <h2 id="home-services" className="text-body font-medium md:absolute md:left-gutter md:top-0">
        {eyebrow}
      </h2>

      <div className="relative mt-6 md:mt-0">
        {/* Videos (one per row, Studio Size); only the active one is visible. */}
        <div
          ref={media}
          aria-hidden="true"
          className="pointer-events-none relative mb-8 aspect-[541/406] w-full md:absolute md:left-0 md:top-0 md:mb-0 md:w-[calc(541*var(--u))]"
        >
          {services.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 overflow-hidden rounded-media transition-opacity duration-300 ease-in ${i === (active ?? last) ? "opacity-100" : "opacity-0"} ${i === active ? "md:opacity-100" : "md:opacity-0"}`}
              style={tops[i] ? { transform: `translateY(${tops[i]}px)` } : undefined}
            >
              <Media media={s.media} mode="manual" active={i === live} sizes="(min-width: 768px) 38vw, 100vw" />
            </div>
          ))}
        </div>

        <ul ref={list} className="md:pl-[calc(685*var(--u))]" onPointerLeave={() => setActive(null)}>
          {services.map((s, i) => (
            <li key={s.id} data-index={i}>
              <AppLink
                href={`/services#${s.id}`}
                className={`block text-list leading-[0.925] transition-colors duration-300 ease-in-out ${i === active ? "text-fg" : "text-dim"}`}
                onPointerEnter={() => canHover && setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span
                  className={`inline-block transition-transform duration-300 ease-in-out ${i === active ? "translate-x-[calc(80*var(--u))]" : "translate-x-0"}`}
                >
                  {s.name}
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const HOVER = "(hover: hover)";
function useCanHover() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(HOVER);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(HOVER).matches,
    () => true,
  );
}
