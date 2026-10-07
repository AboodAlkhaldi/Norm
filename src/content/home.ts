import { media } from "./media";
import type { TileFormat } from "./types";

/** Home page copy. From the AI-generated NORM site unless noted. */
export const home = {
  hero: {
    lines: ["The Norm of", "cinematic"],
    /** The rotating last word. Add words to rotate through them (AI site uses only "creation"). */
    rotatingWords: ["creation"],
    playReel: "Play reel",
    background: media.heroReel,
  },
  featured: {
    title: "Featured Work",
    viewAll: { label: "View All", href: "/portfolio" },
  },
  manifesto: ["Story first.", "Craft in every frame."],
  services: {
    eyebrow: "Services",
  },
  about: {
    /** Rail tiles and their box sizes (Studio Size order: 4:5, 2:3, 4:3, 4:5). */
    images: [media.calligraphy, media.character, media.graphicStorytelling, media.terrainMotion],
    formats: ["portrait", "tall", "landscape", "portrait"] as TileFormat[],
    paragraphs: [
      "Every frame starts with a decision: what should the audience feel, understand or remember? We build the idea, the visual language and the production around that answer.",
      "NORM brings film, motion and post-production together through a distributed creative network. One direction connects the work, from the first treatment to the final delivery.",
    ],
    button: { label: "About studio", href: "/about" },
  },
  cta: {
    title: ["Create something", "that moves people."],
    button: { label: "Get in touch", href: "/contact" },
    background: media.cameraSilhouette,
  },
};
