import { legalPages } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";
import { TextPage } from "@/components/sections/TextPage";

export const metadata = pageMetadata({ title: "Privacy", description: "Privacy policy for NORM.", path: "/privacy" });

export default function PrivacyPage() {
  return <TextPage title={legalPages.privacy.title} sections={legalPages.privacy.sections} />;
}
