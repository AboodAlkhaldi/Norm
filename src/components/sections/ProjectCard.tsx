import type { Project } from "@/content/types";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/media/Media";
import { tileSizes, tileStyle } from "@/components/media/tiles";

/**
 * Project tile: hover-playing media + title + category.
 * - `variant="rail"` (Featured Work): every card 427 × 534 (4:5) at 1440 — Studio Size
 * - `variant="grid"`: fills its grid column at 4:3 (Studio Size portfolio, 427 × 320)
 * Text (Studio Size): name 24px medium, 30px under the media; line below 18px grey #767676.
 */
export function ProjectCard({
  project,
  className = "",
  variant = "rail",
  sizes,
}: {
  project: Project;
  className?: string;
  variant?: "rail" | "grid";
  sizes?: string;
}) {
  const rail = variant === "rail";
  return (
    <AppLink
      href={`/work/${project.slug}`}
      data-hover-root=""
      className={`group block ${rail ? "shrink-0" : ""} ${className}`}
      style={rail ? { width: tileStyle("portrait").width } : undefined}
      draggable={false}
    >
      <div
        className={`relative overflow-hidden rounded-media bg-surface ${rail ? "" : "aspect-[4/3]"}`}
        style={rail ? { height: tileStyle("portrait").height } : undefined}
      >
        <div className="size-full transition-transform duration-700 ease-page group-hover:scale-[1.03]">
          <Media media={project.cover} mode="hover" sizes={sizes ?? (rail ? tileSizes("portrait") : "(min-width: 768px) 30vw, 100vw")} />
        </div>
        {/* AI site "card-cursor": round arrow that scales in on hover / keyboard focus. */}
        <span
          aria-hidden="true"
          className="absolute bottom-5 right-5 grid size-circle scale-[0.8] place-items-center rounded-full bg-fg text-bg opacity-0 transition-[opacity,scale] duration-300 ease-ui group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12L12 4M5.5 4H12v6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className="pt-[clamp(16px,calc(30*var(--u)),40px)]">
        <h3 className="text-card">{project.title}</h3>
        <p className="mt-[clamp(3px,calc(5*var(--u)),7px)] text-body leading-[1.2] text-[#767676]">{project.category}</p>
      </div>
    </AppLink>
  );
}
