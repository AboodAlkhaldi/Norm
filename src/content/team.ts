import { media } from "./media";
import type { TeamMember } from "./types";

/** Team. Names, roles and portraits from the AI-generated NORM site. */
export const team: TeamMember[] = [
  { name: "Sohaib", role: "Creative Director", photo: media.teamSohaib, placeholder: true },
  { name: "Osama", role: "Executive Producer", photo: media.teamOsama, placeholder: true },
  { name: "Layan", role: "Motion Designer", photo: media.teamLayan, placeholder: true },
  { name: "Faris", role: "3D Artist", photo: media.teamFaris, placeholder: true },
  { name: "Ragat", role: "Art Director", photo: media.teamRagat, placeholder: true },
  { name: "Noura", role: "Producer", photo: media.teamNoura, placeholder: true },
];
