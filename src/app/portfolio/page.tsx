import { projects, portfolioFilters, portfolioPage } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { CtaBlock } from "@/components/sections/CtaBlock";

export const metadata = pageMetadata({
  title: "Portfolio",
  description: "Selected film, motion, post-production and design work by NORM.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <>
      <PortfolioGrid title={portfolioPage.title} projects={projects} filters={portfolioFilters} />
      <CtaBlock {...portfolioPage.cta} variant="surface" className="mt-[clamp(96px,calc(180*var(--u)),240px)]" />
    </>
  );
}
