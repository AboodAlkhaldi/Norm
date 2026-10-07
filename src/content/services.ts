import { media } from "./media";
import type { Service } from "./types";

/** The 6 services. Copy from the AI-generated NORM site. Media are placeholders. */
export const services: Service[] = [
  {
    id: "motion",
    name: "Motion",
    title: "Motion",
    description:
      "Give ideas a rhythm people can follow. We turn type, illustration and graphic systems into moving stories, from a single ident to a complete motion language.",
    tags: ["2D animation", "Kinetic typography", "Motion systems"],
    media: media.characterLoop,
    kinetic: { lines: ["ME", "OV"] },
    placeholder: true,
  },
  {
    id: "post-audio",
    name: "Post & audio",
    title: "Post & audio",
    description:
      "Shape the feeling of the final film. Editing, colour, compositing and sound come together around the pace of the story, with each cut and detail earning its place.",
    tags: ["Editing", "Colour grading", "Sound design & mix"],
    media: media.colourProcess,
    placeholder: true,
  },
  {
    id: "social-media",
    name: "Social media",
    title: "Social media",
    description:
      "Make the idea work where people meet it. We create short films, motion-led campaigns and modular content that holds attention across formats and platforms.",
    tags: ["Short-form film", "Campaign cutdowns", "Platform formats"],
    media: media.redDancer,
    placeholder: true,
  },
  {
    id: "vfx",
    name: "VFX",
    title: "VFX",
    description:
      "Build what the camera cannot capture. From invisible clean-up to complete environments, we combine live action and digital craft so the effect belongs inside the story.",
    tags: ["Compositing", "Digital environments", "Simulation"],
    media: media.compositingProcess,
    placeholder: true,
  },
  {
    id: "brand-content",
    name: "Brand & content",
    title: "Brand & content",
    description:
      "Give every piece of communication a shared character. We shape visual identities and content systems that connect a launch film, a campaign and the everyday expression of the brand.",
    tags: ["Visual identity", "Art direction", "Campaign content"],
    media: media.violinist,
    placeholder: true,
  },
  {
    id: "3d-motion",
    name: "3D motion",
    title: "3D motion",
    description:
      "Make an imagined world feel tangible. Modelling, material, light and camera movement bring products and abstract ideas to life, with detail designed to reward a closer look.",
    tags: ["Product CGI", "3D animation", "Materials & lighting"],
    media: media.architecturalMotion,
    placeholder: true,
  },
];

export const servicesPage = {
  eyebrow: "Services",
  title: ["The Norm of", "cinematic creation"],
  intro: "Motion, post & audio, social media, VFX, brand & content, and 3D motion.",
  rowButton: { label: "Get in touch", href: "/contact" },
  cta: {
    title: ["Tell us what", "you’re imagining."],
    text: "Share the idea, the challenge, or the brief.",
    button: { label: "Get in touch", href: "/contact" },
  },
};
