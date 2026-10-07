import type { Metadata } from "next";
import { site } from "@/content/site";
import { media } from "@/content/media";

/** Per-page metadata with matching Open Graph / Twitter tags. */
export function pageMetadata({
  title,
  description = site.description,
  path = "/",
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: { src: string; width: number; height: number; alt: string };
}): Metadata {
  const og = image ?? media.og;
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.tagline}`;
  return {
    title: title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description,
      url: path,
      images: [{ url: og.src, width: og.width, height: og.height, alt: og.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [og.src],
    },
  };
}
