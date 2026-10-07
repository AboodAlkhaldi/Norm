import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";

type Variant = "outline" | "filled" | "light";

/**
 * One pill size for the whole site (owner: "all buttons the same size") — Studio Size's
 * "View All": 54px tall at 1440, 26px side padding, 14px text, 2px border.
 * Shared with filter pills, the header CTA and the email buttons via `pillBase`.
 */
export const pillBase =
  "inline-flex h-btn items-center justify-center whitespace-nowrap rounded-full border-2 px-btn-x text-ui font-normal transition-[background-color,color,border-color] duration-300 ease-ui select-none";

const variants: Record<Variant, string> = {
  // Studio Size: 2px #1d1d1d border on black
  outline: "border-pill text-fg hover:border-fg hover:bg-fg hover:text-bg",
  // Black pill inside grey CTA blocks / popover
  filled: "border-bg bg-bg text-fg hover:bg-fg hover:text-bg hover:border-fg",
  // Filter pill active state
  light: "border-fg bg-fg text-bg",
};

export function buttonClasses(variant: Variant = "outline", className = "") {
  return `${pillBase} ${variants[variant]} ${className}`;
}

type Common = { variant?: Variant; className?: string; children: ReactNode };

/** Pill link (internal or external). */
export function ButtonLink({
  href,
  variant,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentProps<typeof AppLink>, "href" | "className" | "children">) {
  return (
    <AppLink href={href} className={buttonClasses(variant, className)} {...rest}>
      {children}
    </AppLink>
  );
}

/** Pill <button>. */
export function Button({
  variant,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClasses(variant, className)} {...rest}>
      {children}
    </button>
  );
}
