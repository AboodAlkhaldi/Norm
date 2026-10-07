import type { Project } from "@/content/types";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/media/Media";

/** Project tile: hover-playing media + title + category (Figma: 432 × 541 media in carousels). */
export function ProjectCard({
  project,
  className = "",
  aspect = "aspect-[432/541]",
  sizes = "(min-width: 768px) 30vw, 80vw",
}: {
  project: Project;
  className?: string;
  aspect?: string;
  sizes?: string;
}) {
  return (
    <AppLink href={`/work/${project.slug}`} data-hover-root="" className={`group block ${className}`} draggable={false}>
      <div className={`relative overflow-hidden rounded-[4px] bg-surface ${aspect}`}>
        <div className="size-full transition-transform duration-700 ease-page group-hover:scale-[1.03]">
          <Media media={project.cover} mode="hover" sizes={sizes} />
        </div>
        {/* AI site "card-cursor": round arrow that scales in on hover / keyboard focus. */}
        <span
          aria-hidden="true"
          className="absolute bottom-5 right-5 grid size-[52px] scale-[0.8] place-items-center rounded-full bg-fg text-bg opacity-0 transition-[opacity,scale] duration-300 ease-ui group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12L12 4M5.5 4H12v6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className="pt-[clamp(14px,calc(22*var(--u)),30px)]">
        <h3 className="text-card">{project.title}</h3>
        <p className="mt-0.5 text-body text-muted">{project.category}</p>
      </div>
    </AppLink>
  );
}
