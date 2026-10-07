import type { Metadata } from "next";
import { HeroTitle } from "@/components/sections/HeroTitle";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Page not found" };

/** 404 in the site's style. */
export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col justify-end px-gutter pt-[clamp(112px,calc(176*var(--u)),230px)]">
      <Reveal immediate>
        <p className="text-body text-muted">{site.notFound.eyebrow}</p>
      </Reveal>
      <HeroTitle lines={site.notFound.title} className="mt-6" />
      <Reveal immediate delay={0.2} className="mt-[clamp(24px,calc(40*var(--u)),56px)] flex flex-wrap gap-3">
        {site.notFound.links.map((l) => (
          <ButtonLink key={l.href} href={l.href}>
            {l.label}
          </ButtonLink>
        ))}
      </Reveal>
    </section>
  );
}
