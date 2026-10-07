"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

/**
 * Single place where GSAP plugins are registered.
 * Eases match MOTION.md: "page" and "ui" are the two curves shared by
 * Studio Size and the AI site.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, CustomEase, useGSAP);
  CustomEase.create("page", "0.44,0,0.28,0.99");
  CustomEase.create("ui", "0.51,0.01,0.2,1");
  gsap.defaults({ ease: "page" });
}

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
