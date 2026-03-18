"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  scrollbarClassName?: string;
}) {
  const overflowMatch = className?.match(/overflow-[xy]-[a-z]+/g) || [];
  const hasOverflowX = overflowMatch.some(o => o.startsWith('overflow-x'));
  
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className?.replace(/overflow-[xy]-[a-z]+/g, '').trim())}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          overflowMatch.includes('overflow-x-auto') && "overflow-x-auto",
          overflowMatch.includes('overflow-x-scroll') && "overflow-x-scroll",
          overflowMatch.includes('overflow-y-auto') && "overflow-y-auto",
          overflowMatch.includes('overflow-y-scroll') && "overflow-y-scroll"
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar orientation="vertical" />
      {hasOverflowX && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none z-20",
        orientation === "vertical" &&
          "h-full w-3 border-l border-l-transparent hover:border-l-border/50",
        orientation === "horizontal" &&
          "h-4 w-full flex-col border-t border-t-transparent hover:border-t-border/50",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "bg-border/70 hover:bg-border relative flex-1 rounded-full transition-colors",
          orientation === "vertical" && "w-full min-h-[40px]",
          orientation === "horizontal" && "h-full min-w-[40px]"
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
