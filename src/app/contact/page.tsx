import { site } from "@/content/site";
import { contactPage } from "@/content/contact";
import { pageMetadata } from "@/lib/metadata";
import { HeroTitle } from "@/components/sections/HeroTitle";
import { EmailRows } from "@/components/overlays/EmailRows";
import { CtaBlock } from "@/components/sections/CtaBlock";

export const metadata = pageMetadata({
  title: "Get in touch",
  description: "New business, careers and collaboration — email NORM.",
  path: "/contact",
});

// Owner decision: follow the AI site — no Featured Work carousel on Contact.
export default function ContactPage() {
  const { newBusiness, careers } = site.emails;
  return (
    <>
      <section className="px-gutter pt-[clamp(112px,calc(176*var(--u)),230px)]">
        <HeroTitle lines={[contactPage.title]} />
        <div className="mt-[clamp(32px,calc(54*var(--u)),72px)]">
          <EmailRows rows={[newBusiness, careers]} copy={contactPage.popover} />
        </div>
      </section>

      <CtaBlock variant="surface" {...contactPage.cta} className="mt-[clamp(96px,calc(200*var(--u)),260px)]" />
    </>
  );
}
