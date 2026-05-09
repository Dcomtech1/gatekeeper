import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-display font-medium tracking-wide uppercase transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-accent hover:text-white",
        signal: "bg-accent text-white hover:bg-foreground hover:text-background",
        ghost: "bg-transparent text-foreground border border-border hover:bg-secondary",
        danger: "bg-denied text-white hover:opacity-80",
      },
      size: {
        default: "h-10 px-6 py-2 text-sm [&_svg]:size-4 gap-2",
        sm: "h-8 px-4 py-1.5 text-xs [&_svg]:size-3.5 gap-1.5",
        md: "h-10 px-6 py-2 text-sm [&_svg]:size-4 gap-2",
        lg: "h-12 px-8 py-3 text-base [&_svg]:size-5 gap-3",
        icon: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant || "primary"}
      data-size={size || "md"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
