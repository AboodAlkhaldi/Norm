import { legalPages } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";
import { TextPage } from "@/components/sections/TextPage";

export const metadata = pageMetadata({ title: "Legal", description: "Legal notice for NORM.", path: "/legal" });

export default function LegalPage() {
  return <TextPage title={legalPages.legal.title} sections={legalPages.legal.sections} />;
}
