import { reasons, whyPage } from "@/content/why";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/sections/PageIntro";
import { NumberedRows } from "@/components/sections/NumberedRows";
import { CtaBlock } from "@/components/sections/CtaBlock";

export const metadata = pageMetadata({
  title: "Why NORM",
  description: whyPage.intro,
  path: "/why-norm",
});

export default function WhyNormPage() {
  return (
    <>
      <PageIntro eyebrow={whyPage.eyebrow} title={whyPage.title} intro={whyPage.intro} />
      <NumberedRows rows={reasons} className="mt-[clamp(56px,calc(100*var(--u)),130px)]" />
      <CtaBlock variant="plain" {...whyPage.cta} className="mt-[clamp(64px,calc(120*var(--u)),160px)]" />
    </>
  );
}
