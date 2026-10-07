import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";

type Variant = "outline" | "filled" | "light";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-ui font-normal transition-[background-color,color,border-color] duration-300 ease-ui select-none";

const variants: Record<Variant, string> = {
  // Figma: 1px #1d1d1d border on black
  outline: "border border-pill text-fg hover:border-fg hover:bg-fg hover:text-bg",
  // Figma: black pill inside grey CTA blocks / popover
  filled: "border border-bg bg-bg text-fg hover:bg-fg hover:text-bg hover:border-fg",
  // Filter pill active state
  light: "border border-fg bg-fg text-bg",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-[21px]", // nav pill (40px)
  md: "h-[clamp(44px,calc(52*var(--u)),64px)] px-[clamp(20px,calc(28*var(--u)),36px)]", // 52px @1440
};

export function buttonClasses(variant: Variant = "outline", size: Size = "md", className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

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
    <AppLink href={href} className={buttonClasses(variant, size, className)} {...rest}>
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
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
