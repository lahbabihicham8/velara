import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Shimmering placeholder used by loading states / Suspense fallbacks.
 */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className,
      )}
      style={{ backgroundSize: "200% 100%" }}
      {...props}
    />
  );
}
