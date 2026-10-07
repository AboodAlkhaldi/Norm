"use client";

import { useState } from "react";
import type { Service } from "@/content/types";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/media/Media";
import { MediaReveal, Reveal, RiseIn } from "@/components/motion/Reveal";

/**
 * Home services list (MOTION.md §7): hovering or focusing a service makes it the
 * active row (white + indented) and swaps the media beside the list.
 */
export function ServicesHoverList({ services, eyebrow, className = "" }: { services: Service[]; eyebrow: string; className?: string }) {
  const [active, setActive] = useState(0);

  return (
    <section className={`grid gap-y-10 px-gutter md:grid-cols-[calc(548*var(--u))_1fr] md:gap-x-[calc(144*var(--u))] ${className}`} aria-labelledby="home-services">
      <div>
        <Reveal>
          <h2 id="home-services" className="text-body">
            {eyebrow}
          </h2>
        </Reveal>
        <MediaReveal className="mt-[clamp(24px,calc(99*var(--u)),130px)] aspect-[548/412] w-full rounded-[4px] bg-surface">
          {services.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-ui ${i === active ? "opacity-100" : "opacity-0"}`}
              aria-hidden={i !== active}
            >
              <Media media={s.media} mode="manual" active={i === active} sizes="(min-width: 768px) 40vw, 100vw" />
            </div>
          ))}
        </MediaReveal>
      </div>

      <ul className="md:pt-[calc(4*var(--u))]">
        {services.map((s, i) => (
          <li key={s.id}>
            <AppLink
              href={`/services#${s.id}`}
              className={`block text-list transition-colors duration-400 ease-ui ${i === active ? "text-fg" : "text-dim hover:text-fg"}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              <RiseIn delay={i * 0.06}>
                <span
                  className={`inline-block transition-transform duration-400 ease-ui ${i === active ? "translate-x-[calc(60*var(--u))]" : "translate-x-0"}`}
                >
                  {s.name}
                </span>
              </RiseIn>
            </AppLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
