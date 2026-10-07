import { services, servicesPage } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/sections/PageIntro";
import { NumberedRows } from "@/components/sections/NumberedRows";
import { CtaBlock } from "@/components/sections/CtaBlock";

export const metadata = pageMetadata({
  title: "Services",
  description: servicesPage.intro,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageIntro eyebrow={servicesPage.eyebrow} title={servicesPage.title} intro={servicesPage.intro} />
      <NumberedRows rows={services} button={servicesPage.rowButton} className="mt-[clamp(56px,calc(100*var(--u)),130px)]" />
      <CtaBlock variant="plain" {...servicesPage.cta} className="mt-[clamp(64px,calc(120*var(--u)),160px)]" />
    </>
  );
}
