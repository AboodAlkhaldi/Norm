import { home } from "@/content/home";
import { services } from "@/content/services";
import { clients } from "@/content/clients";
import { featuredProjects } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";
import { HomeHero } from "@/components/sections/HomeHero";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { ClientLogos } from "@/components/sections/ClientLogos";
import { ServicesHoverList } from "@/components/sections/ServicesHoverList";
import { ImageStrip } from "@/components/sections/ImageStrip";
import { CtaBlock } from "@/components/sections/CtaBlock";
import { RevealLines } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = pageMetadata({ path: "/" });

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <FeaturedWork
        projects={featuredProjects()}
        title={home.featured.title}
        viewAll={home.featured.viewAll}
        className="mt-[clamp(80px,calc(100*var(--u)),140px)]"
      />

      <section className="mt-section px-gutter" aria-label="Manifesto">
        <RevealLines as="h2" className="text-display">
          {home.manifesto.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </RevealLines>
      </section>

      <ClientLogos clients={clients} className="mt-[clamp(64px,calc(140*var(--u)),180px)]" />

      <ServicesHoverList services={services} eyebrow={home.services.eyebrow} className="mt-section" />

      <ImageStrip
        className="mt-section"
        label="Inside NORM"
        items={home.about.images}
        paragraphs={home.about.paragraphs}
        action={<ButtonLink href={home.about.button.href}>{home.about.button.label}</ButtonLink>}
      />

      <CtaBlock
        variant="media"
        media={home.cta.background}
        title={home.cta.title}
        button={home.cta.button}
        className="mt-section"
      />
    </>
  );
}
