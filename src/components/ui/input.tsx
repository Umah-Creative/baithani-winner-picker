import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full border border-input bg-background text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-10 rounded-lg px-3 py-2 text-sm",
        range:
          "h-11 rounded-xl bg-transparent px-2 text-center font-mono text-xl font-semibold tabular-nums",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

function Input(props: InputProps) {
  const { className, variant, ...rest } = props;

  return (
    <input
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...rest}
    />
  );
}

export { Input, inputVariants };
