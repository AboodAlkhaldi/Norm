import type { MetadataRoute } from "next";
import { NOINDEX } from "@/lib/env";

/** Blocks all crawlers until launch (NEXT_PUBLIC_NOINDEX=false to allow). */
export default function robots(): MetadataRoute.Robots {
  return NOINDEX ? { rules: { userAgent: "*", disallow: "/" } } : { rules: { userAgent: "*", allow: "/" } };
}
