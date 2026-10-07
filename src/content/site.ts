import { media } from "./media";
import type { Link, Social } from "./types";

/** Site-wide content: name, taglines, navigation, footer, socials, emails. */
export const site = {
  name: "NORM",
  tagline: "The Norm of cinematic creation",
  description:
    "NORM is a creative production company bringing ideas to life through film, motion, visual effects, post-production and brand content.",
  /** Public URL — used for metadata. Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  nav: [
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Why NORM", href: "/why-norm" },
  ] satisfies Link[],
  navCta: { label: "Get in touch", href: "/contact" } satisfies Link,

  emails: {
    newBusiness: { label: "New business", address: "info@norm-prod.com" },
    // PLACEHOLDER: careers has its own address — replace when it is confirmed.
    careers: { label: "Careers & collaboration", address: "info@norm-prod.com", subject: "Careers & collaboration", placeholder: true },
  },

  socials: [
    { label: "Instagram", href: "https://www.instagram.com/norm.prod/", preview: media.socialInstagram },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/norm-prod/", preview: media.socialLinkedin },
    // Link from the owner (2026-10-07); preview = brief of the channel.
    { label: "YouTube", href: "https://www.youtube.com/channel/UC4jcwaqzp9PPDx77_y541dQ", preview: media.socialYoutube },
  ] satisfies Social[],

  notFound: {
    eyebrow: "404",
    title: ["Page not found."],
    links: [
      { label: "Back to home", href: "/" },
      { label: "View the portfolio", href: "/portfolio" },
    ] satisfies Link[],
  },

  footer: {
    tagline: "The Norm of cinematic creation",
    links: [
      { label: "Index", href: "/portfolio" },
      { label: "Legal", href: "/legal" },
      { label: "Privacy", href: "/privacy" },
    ] satisfies Link[],
    copyright: "© NORM — All rights reserved.",
  },
} as const;
