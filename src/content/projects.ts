import { media } from "./media";
import type { PortfolioFilter, Project } from "./types";

/**
 * Projects. Titles, categories and summaries come from the AI-generated NORM site;
 * "Posture" is the Figma case study. All media are placeholders.
 *
 * Order here = order on /portfolio. `featured: true` = shown in Featured Work carousels.
 */
export const projects: Project[] = [
  {
    slug: "norm-in-motion",
    title: "NORM in motion",
    category: "Studio reel",
    filters: ["film", "motion"],
    project: "NORM Production — Company Reel",
    services: "Studio reel",
    summary:
      "A selection of motion, animation, visual effects and finishing from the NORM company reel. Different techniques come together around the same purpose: making the story clear and memorable.",
    cover: media.nightLoop,
    blocks: [
      { type: "video", media: media.heroReel },
      { type: "imagePair", media: [media.calligraphy, media.character] },
      { type: "video", media: media.terrainMotion },
      { type: "credits", items: [{ role: "Studio", name: "NORM Production" }] },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "kinetic-stories",
    title: "Kinetic stories",
    category: "NORM · Motion & typography",
    filters: ["motion", "design"],
    project: "NORM Production — Reel excerpt",
    services: "Motion & typography",
    summary:
      "Words, illustration and objects become a moving visual language. This excerpt from the NORM reel combines Arabic typography with dimensional animation.",
    cover: media.kineticBooks,
    blocks: [
      { type: "video", media: media.kineticBooks },
      { type: "imagePair", media: [media.graphicStorytelling, media.character] },
      { type: "credits", items: [{ role: "Studio", name: "NORM Production" }] },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "oura",
    title: "Ring True to You",
    category: "BUCK · Product motion reference",
    filters: ["motion"],
    project: "BUCK — Oura: Ring True to You",
    services: "Product motion reference",
    summary:
      "A reference for premium product storytelling: tactile material, controlled light and a clear colour system. This campaign was created by BUCK for Oura and is shown here as a visual reference.",
    cover: media.redHand,
    blocks: [
      { type: "video", media: media.redHand },
      { type: "video", media: media.smoke },
      { type: "credits", items: [{ role: "Created by", name: "BUCK" }] },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "this",
    title: "This.",
    category: "Builders Club · CGI reference",
    filters: ["motion", "design"],
    project: "Builders Club — This. / Mimecast",
    services: "CGI reference",
    summary:
      "An authored digital world built through modelling, texturing, lighting and animation. A reference for atmosphere and visual worldbuilding, created by Builders Club.",
    cover: media.smoke,
    blocks: [
      { type: "video", media: media.smoke },
      { type: "video", media: media.cameraSilhouette },
      { type: "credits", items: [{ role: "Created by", name: "Builders Club" }] },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "place-in-motion",
    title: "Place in motion",
    category: "NORM · 3D animation",
    filters: ["motion"],
    project: "NORM Production — Reel excerpt",
    services: "3D animation",
    summary:
      "Terrain, architecture and camera movement turn information into a sense of place. Selected frames and sequences from the NORM company reel.",
    cover: media.architecturalMotion,
    blocks: [
      { type: "video", media: media.architecturalMotion },
      { type: "video", media: media.terrainMotion },
      { type: "image", media: media.calligraphy, size: "large" },
      { type: "credits", items: [{ role: "Studio", name: "NORM Production" }] },
    ],
    featured: false,
    placeholder: true,
  },
  {
    slug: "the-final-frame",
    title: "The final frame",
    category: "NORM · Compositing & colour",
    filters: ["post", "film"],
    project: "NORM Production — Post-production reel excerpts",
    services: "Compositing & colour",
    summary:
      "From isolating a subject to integrating the final image, then shaping contrast and colour. These reel excerpts show the process as well as the finished frame.",
    cover: media.colourProcess,
    blocks: [
      { type: "video", media: media.colourProcess },
      { type: "imagePair", media: [media.processMatte, media.processComposite] },
      { type: "video", media: media.compositingProcess },
      { type: "image", media: media.processColour, size: "large" },
      { type: "credits", items: [{ role: "Studio", name: "NORM Production" }] },
    ],
    featured: false,
    placeholder: true,
  },
  {
    slug: "equilibrium",
    title: "Equilibrium",
    category: "Ordinary Folk · Design reference",
    filters: ["design"],
    project: "Ordinary Folk — Equilibrium",
    services: "Design reference",
    summary:
      "A reference for the relationship between composition, material and movement. Reflective surfaces and a restrained colour palette make simple geometry feel tactile. Created by Ordinary Folk.",
    cover: media.cameraSilhouette,
    blocks: [
      { type: "video", media: media.cameraSilhouette },
      { type: "video", media: media.violinist },
      { type: "credits", items: [{ role: "Created by", name: "Ordinary Folk" }] },
    ],
    featured: false,
    placeholder: true,
  },
  {
    // Figma case study — image-led template.
    slug: "posture",
    title: "Posture",
    category: "Product photography",
    filters: ["design"],
    project: "Reference study",
    services: "Photography & art direction",
    cover: media.postureWhiteRose,
    blocks: [
      { type: "image", media: media.postureWhiteRose, size: "medium" },
      { type: "statement", text: "Shape. Balance. Light." },
      { type: "image", media: media.posturePedestal, size: "large" },
      { type: "statement", text: "A study in physical form.", size: "large" },
      { type: "imagePair", media: [media.postureEucalyptus, media.postureHydrangea] },
      { type: "credits", items: [{ role: "Photography", name: "Placeholder — Unsplash" }] },
    ],
    featured: true,
    placeholder: true,
  },
];

export const portfolioFilters: { id: "all" | PortfolioFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "film", label: "Film" },
  { id: "motion", label: "Motion" },
  { id: "post", label: "Post" },
  { id: "design", label: "Design" },
];

export const portfolioPage = {
  title: "Portfolio",
  cta: {
    title: ["Tell us what", "you’re imagining."],
    text: "Share the idea, the challenge, or the brief.",
    button: { label: "Get in touch", href: "/contact" },
  },
};

export const featuredProjects = (exclude?: string) =>
  projects.filter((p) => p.featured && p.slug !== exclude).concat(
    // Keep carousels full on project pages: top up with non-featured work.
    exclude ? projects.filter((p) => !p.featured && p.slug !== exclude).slice(0, 1) : [],
  );

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
