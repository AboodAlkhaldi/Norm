"use client";

import { ArrowButton } from "@/components/ui/ArrowButton";
import { useCarousel } from "./Carousel";

/** Prev / next buttons wired to the surrounding <Carousel>. */
export function CarouselArrows({ labels = ["Previous", "Next"] }: { labels?: [string, string] }) {
  const { prev, next, canPrev, canNext } = useCarousel();
  return (
    <>
      <ArrowButton direction="prev" onClick={prev} disabled={!canPrev} aria-label={labels[0]} />
      <ArrowButton direction="next" onClick={next} disabled={!canNext} aria-label={labels[1]} />
    </>
  );
}
