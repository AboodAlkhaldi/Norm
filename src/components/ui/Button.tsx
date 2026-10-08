import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";

type Variant = "outline" | "filled" | "light";

/**
 * Pills — Studio Size's buttons: 14px medium text (-1% tracking), 2px border.
 * - "md" (default, every page button): "View All" — 54px tall at 1440, 26px side padding.
 *   Shared with filter pills and the email buttons via `pillBase`.
 * - "nav" (header only): "Get in touch" — 40px tall, 20px side padding.
 */
const pillShape =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 text-ui font-medium tracking-[-0.01em] transition-[background-color,color,border-color] duration-300 ease-ui select-none";
export const pillBase = `${pillShape} h-btn px-btn-x`;
export const pillNav = `${pillShape} h-[clamp(36px,calc(40*var(--u)),50px)] px-[clamp(16px,calc(20*var(--u)),26px)]`;

const variants: Record<Variant, string> = {
  // Studio Size: 2px #1d1d1d border on black
  outline: "border-pill text-fg hover:border-fg hover:bg-fg hover:text-bg",
  // Black pill inside grey CTA blocks / popover
  filled: "border-bg bg-bg text-fg hover:bg-fg hover:text-bg hover:border-fg",
  // Filter pill active state
  light: "border-fg bg-fg text-bg",
};

export function buttonClasses(variant: Variant = "outline", className = "", size: "md" | "nav" = "md") {
  return `${size === "nav" ? pillNav : pillBase} ${variants[variant]} ${className}`;
}

type Common = { variant?: Variant; size?: "md" | "nav"; className?: string; children: ReactNode };

/** Pill link (internal or external). */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...rest
}: Common & { href: string } & Omit<ComponentProps<typeof AppLink>, "href" | "className" | "children">) {
  return (
    <AppLink href={href} className={buttonClasses(variant, className, size)} {...rest}>
      {children}
    </AppLink>
  );
}

/** Pill <button>. */
export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} className={buttonClasses(variant, className, size)} {...rest}>
      {children}
    </button>
  );
}
