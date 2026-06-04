import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/90 shadow-sm",
        destructive: "bg-error text-on-error hover:bg-error/90",
        outline:
          "border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface",
        secondary: "bg-secondary text-on-secondary hover:bg-secondary/90",
        ghost: "hover:bg-surface-container-low text-on-surface",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
