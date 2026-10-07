"use client";

import type { Project } from "@/content/types";
import { Carousel } from "@/components/carousel/Carousel";
import { CarouselArrows } from "@/components/carousel/CarouselArrows";
import { ButtonLink } from "@/components/ui/Button";
import { RevealLines, Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "./ProjectCard";

/** "Featured Work" header + carousel of project cards. */
export function FeaturedWork({
  projects,
  title = "Featured Work",
  viewAll = { label: "View All", href: "/portfolio" },
  className = "",
}: {
  projects: Project[];
  title?: string;
  viewAll?: { label: string; href: string };
  className?: string;
}) {
  return (
    <section className={className} aria-labelledby="featured-title">
      <Carousel
        label={title}
        header={
          <div className="mb-title-gap flex items-center justify-between gap-6 px-gutter">
            <RevealLines as="h2" className="text-title">
              <span id="featured-title">{title}</span>
            </RevealLines>
            <Reveal className="flex items-center gap-[5px]">
              <ButtonLink href={viewAll.href}>
                {viewAll.label}
              </ButtonLink>
              <CarouselArrows labels={["Previous projects", "Next projects"]} />
            </Reveal>
          </div>
        }
      >
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </Carousel>
    </section>
  );
}
