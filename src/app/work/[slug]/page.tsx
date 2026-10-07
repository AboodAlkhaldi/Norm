import { notFound } from "next/navigation";
import { featuredProjects, getProject, projects } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";
import { HeroTitle } from "@/components/sections/HeroTitle";
import { ProjectBlocks } from "@/components/sections/ProjectBlocks";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { Reveal } from "@/components/motion/Reveal";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary ?? `${project.title} — ${project.services}. A NORM project.`,
    path: `/work/${project.slug}`,
    image: project.cover.kind === "image" ? project.cover : { src: project.cover.poster, width: project.cover.width, height: project.cover.height, alt: project.cover.alt },
  });
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const meta = [
    { label: "Project", value: project.project },
    { label: "Services", value: project.services },
    project.client ? { label: "Client", value: project.client } : null,
    project.year ? { label: "Year", value: project.year } : null,
  ].filter((m): m is { label: string; value: string } => m !== null);

  return (
    <>
      <header className="px-gutter pt-[clamp(112px,calc(176*var(--u)),230px)]">
        <HeroTitle lines={[project.title]} />
        <Reveal immediate delay={0.15} as="dl" className="mt-[clamp(32px,calc(60*var(--u)),80px)] grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-[calc(462*var(--u))_calc(462*var(--u))_1fr_1fr] md:gap-x-0">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-body text-muted">{m.label}</dt>
              <dd className="mt-[clamp(4px,calc(8*var(--u)),12px)] text-card font-normal">{m.value}</dd>
            </div>
          ))}
        </Reveal>
        {project.summary && (
          <Reveal className="mt-[clamp(32px,calc(60*var(--u)),80px)] md:ml-[calc(462*var(--u))] md:max-w-[calc(700*var(--u))]">
            <p className="text-lead">{project.summary}</p>
          </Reveal>
        )}
      </header>

      <article className="mt-[clamp(48px,calc(54*var(--u)),80px)]" aria-label={`${project.title} — project`}>
        <ProjectBlocks blocks={project.blocks} />
      </article>

      <FeaturedWork projects={featuredProjects(project.slug)} className="mt-[clamp(120px,calc(220*var(--u)),300px)]" />
    </>
  );
}
