"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";

/**
 * Smoothly counts up to `value` when scrolled into view.
 * Renders pre/post-formatted text via the `format` callback.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 1.1,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, format]);

  return (
    <span ref={ref} className={className}>
      {format(0)}
    </span>
  );
}
