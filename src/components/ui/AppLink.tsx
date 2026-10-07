"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePageTransition } from "@/components/motion/PageTransition";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Internal link that plays the page transition. External links (http, mailto)
 * render as a plain <a>. Use this for every link on the site.
 */
export function AppLink({ href, onNavigate, ...rest }: Props) {
  const { navigate } = usePageTransition();
  const external = /^(https?:|mailto:|tel:)/.test(href);

  if (external) {
    const { prefetch: _prefetch, replace: _replace, scroll: _scroll, ...a } = rest as ComponentProps<typeof Link>;
    void _prefetch;
    void _replace;
    void _scroll;
    const isWeb = href.startsWith("http");
    return (
      <a
        href={href}
        {...(a as ComponentProps<"a">)}
        {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      />
    );
  }

  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        onNavigate?.(e);
        if (navigate(href)) e.preventDefault();
      }}
    />
  );
}
