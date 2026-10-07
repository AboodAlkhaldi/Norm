"use client";

import Image from "next/image";
import type { TeamMember } from "@/content/types";
import { Carousel } from "@/components/carousel/Carousel";
import { CarouselArrows } from "@/components/carousel/CarouselArrows";
import { MediaReveal, Reveal, RevealLines } from "@/components/motion/Reveal";
import { tileSizes, tileStyle } from "@/components/media/tiles";

/**
 * Team — Studio Size /studio team module: two giant figures ("Founded 2023" on the
 * left, "Team of N" on the right), then a rail of 4:5 portraits (427 × 534 at 1440)
 * with name and role, and the arrows underneath.
 */
export function TeamSection({
  team,
  founded,
  title,
  className = "",
}: {
  team: TeamMember[];
  founded: string;
  /** Section heading for screen readers (the design shows only the figures). */
  title: string;
  className?: string;
}) {
  const figure = (label: string, value: string) => (
    <div className="flex flex-col">
      <Reveal>
        <p className="text-body font-medium">{label}</p>
      </Reveal>
      <RevealLines className="text-[clamp(120px,calc(360*var(--u)),480px)] font-semibold leading-[0.8] tracking-[-0.06em]">
        <span className="block pr-[0.06em]">{value}</span>
      </RevealLines>
    </div>
  );

  return (
    <section className={className} aria-labelledby="team">
      <h2 id="team" className="sr-only">
        {title}
      </h2>
      <Carousel
        label={title}
        header={
          <div className="mb-title-gap flex justify-between gap-8 px-gutter">
            {figure("Founded", founded)}
            {figure("Team of", String(team.length))}
          </div>
        }
        footer={
          <div className="mt-[clamp(28px,calc(40*var(--u)),52px)] flex gap-[5px] px-gutter">
            <CarouselArrows labels={["Previous team member", "Next team member"]} />
          </div>
        }
      >
        {team.map((m, i) => (
          <div key={m.name} className="shrink-0" style={{ width: tileStyle("portrait").width }}>
            <MediaReveal delay={Math.min(i, 3) * 0.08} className="rounded-media bg-surface" style={{ height: tileStyle("portrait").height }}>
              <Image src={m.photo.src} alt={m.photo.alt} fill sizes={tileSizes("portrait")} className="object-cover" draggable={false} />
            </MediaReveal>
            <div className="pt-[clamp(16px,calc(30*var(--u)),40px)]">
              <p className="text-card">{m.name}</p>
              <p className="text-body text-[#767676]">{m.role}</p>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
