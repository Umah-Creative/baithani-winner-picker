import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-[var(--background)] hover:brightness-110",
        primary:
          "bg-[var(--brand)] text-[var(--background)] hover:brightness-110",
        secondary:
          "border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20",
        ghost:
          "text-white/70 hover:bg-white/10 hover:text-white",
        outline:
          "border border-white/20 bg-transparent text-white hover:bg-white/10",
        destructive:
          "bg-red-500/20 text-red-200 hover:bg-red-500/30",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

function Button(props: ButtonProps) {
  const {
    className,
    variant = "default",
    size = "default",
    type = "button",
    ...rest
  } = props;

  return (
    <button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    />
  );
}

export { Button, buttonVariants };
