"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { AppLink } from "@/components/ui/AppLink";
import { VideoTile } from "@/components/media/VideoTile";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * Footer (every page): social links with Studio Size-style hover video previews
 * (MOTION.md §13), the giant wordmark (§12) and the bottom bar.
 */
export function Footer() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <footer className="mt-[clamp(120px,calc(282*var(--u)),360px)] px-gutter pb-[clamp(16px,calc(20*var(--u)),28px)]">
      <ul className="flex flex-col gap-3 border-t border-line pt-[clamp(14px,calc(18*var(--u)),24px)] md:flex-row md:justify-between md:gap-0">
        {site.socials.map((s, i) => {
          const align = i === 0 ? "left-0" : i === site.socials.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2";
          return (
            <li key={s.label} className="relative">
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-lead transition-colors duration-300 ease-in-out ${hovered !== null && hovered !== i ? "md:text-[#434343]" : ""}`}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
              >
                {s.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-full z-10 mt-3 hidden aspect-video w-[clamp(220px,calc(310*var(--u)),420px)] overflow-hidden rounded-[5px] transition-opacity duration-300 ease-in-out md:block ${align} ${
                  hovered === i ? "opacity-100" : "opacity-0"
                }`}
              >
                <VideoTile media={s.preview} mode="manual" active={hovered === i} sizes="420px" className="size-full" />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pt-[clamp(120px,calc(237*var(--u)),320px)]">
        <AppLink href="/" aria-label="NORM — back to home" className="block">
          <Wordmark className="h-auto w-full text-fg" />
        </AppLink>
      </div>

      <div className="mt-[clamp(20px,calc(45*var(--u)),56px)] flex flex-col gap-4 text-body md:flex-row md:items-baseline md:justify-between">
        <p>{site.footer.tagline}</p>
        <div className="flex flex-wrap items-baseline gap-x-[clamp(24px,calc(80*var(--u)),110px)] gap-y-2">
          <nav aria-label="Footer">
            <ul className="flex gap-x-[clamp(24px,calc(80*var(--u)),110px)]">
              {site.footer.links.map((l) => (
                <li key={l.href + l.label}>
                  <AppLink href={l.href} className="transition-colors duration-300 hover:text-muted">
                    {l.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
          <p>{site.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
