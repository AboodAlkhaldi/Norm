import { clientLogo } from "./media";
import type { Client } from "./types";

/** Client logos. PLACEHOLDER: dummy marks until the real logos arrive. */
export const clients: Client[] = Array.from({ length: 7 }, (_, i) => ({
  name: `Client ${String(i + 1).padStart(2, "0")}`,
  logo: clientLogo(i + 1),
  placeholder: true,
}));
