import { media } from "./media";

/** About page. Copy from the AI-generated NORM site unless noted. */
export const aboutPage = {
  title: ["Independent minds.", "Shared direction."],
  strip: [media.btsInterview, media.studioCamera, media.cameraSilhouette],
  paragraphs: [
    "Founded in July 2023, NORM is a creative production company working across film, animation, visual effects and brand content.",
    "Our creative network spans four continents. We bring the people and disciplines a project needs together around a clear story and a shared standard of craft.",
  ],
  perspectives: {
    title: ["Different perspectives.", "Shared purpose."],
    /** Middle tile renders the kinetic type from Figma. */
    media: [media.character, media.calligraphy],
    kinetic: ["ME", "OV"] as [string, string],
    paragraphs: [
      "A finished frame rarely shows the decisions behind it. Ideas become treatments and storyboards; images are built, photographed, animated, edited and refined.",
      "The process is visible here: isolating a subject, building the composite and shaping the colour. Each step serves the story the audience will finally see.",
    ],
  },
  team: {
    title: "The people behind NORM",
    // From Figma (the AI site has no intro line here).
    intro: "A distributed creative network bringing different perspectives to a shared brief.",
  },
  howWeWork: {
    title: "How we work",
    // PLACEHOLDER bodies: neither the AI site nor Figma has copy for these yet.
    steps: [
      { title: "Understand", body: "Placeholder — how NORM learns the brief, the audience and what the work needs to achieve.", placeholder: true },
      { title: "Develop", body: "Placeholder — how the idea becomes a treatment, a visual language and a production plan.", placeholder: true },
      { title: "Create", body: "Placeholder — how the team shoots, animates, builds and edits the work.", placeholder: true },
      { title: "Refine", body: "Placeholder — how colour, sound and finishing bring the work to its final form.", placeholder: true },
    ],
  },
  inside: {
    title: "Inside the process",
    media: [media.processGreenScreen, media.processMatte, media.processComposite],
  },
  cta: {
    title: ["Tell us what", "you’re imagining."],
    text: "Share the idea, the challenge, or the brief.",
    button: { label: "Get in touch", href: "/contact" },
  },
};
