import { media } from "./media";
import type { Reason } from "./types";

/** Why NORM page. Copy from the AI-generated NORM site. Media are placeholders. */
export const whyPage = {
  eyebrow: "Why NORM",
  title: ["Your challenge.", "Our craft."],
  intro: "Every project starts with a question: what does this work need to achieve?",
  cta: {
    title: ["Tell us what", "you’re imagining."],
    text: "Share the idea, the challenge, or the brief.",
    button: { label: "Get in touch", href: "/contact" },
  },
};

export const reasons: Reason[] = [
  {
    title: "Make a complex idea clear.",
    description:
      "Too much information can hide the story. We find the central idea and give it a visual language, using movement, composition and rhythm to make it easy to understand.",
    tags: ["Clear thinking", "Visual storytelling"],
    media: media.redHand,
    placeholder: true,
  },
  {
    title: "Give the brand its own world.",
    description:
      "When everything in a category starts to look alike, another familiar image will not help. We develop a distinctive visual direction around the brand, the audience and the feeling the work should leave behind.",
    tags: ["Distinctive direction", "Worldbuilding"],
    media: media.terrainMotion,
    placeholder: true,
  },
  {
    title: "Make the idea feel tangible.",
    description:
      "A good concept deserves a convincing finish. We consider texture, light, movement and sound together, so the work feels deliberate at every scale and on every screen.",
    tags: ["Material & light", "Connected craft"],
    media: media.violinist,
    placeholder: true,
  },
  {
    title: "Keep the details connected.",
    description:
      "Small compromises add up. One creative direction carries through development, production and finishing, keeping the original intention visible in the final work.",
    tags: ["One creative direction", "Careful finishing"],
    media: media.colourProcess,
    placeholder: true,
  },
];
