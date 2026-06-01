import { cn } from "@/lib/utils";

/**
 * Initials avatar with a deterministic gradient derived from the seed.
 */
export function Avatar({
  initials,
  seed,
  className,
}: {
  initials: string;
  seed?: string;
  className?: string;
}) {
  const hue = hashHue(seed ?? initials);
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm ring-2 ring-card",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.6 0.18 ${hue}), oklch(0.55 0.2 ${(hue + 40) % 360}))`,
      }}
    >
      {initials}
    </span>
  );
}

function hashHue(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) % 360;
  }
  return h;
}
