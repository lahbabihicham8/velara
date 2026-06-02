import { cn } from "@/lib/utils";

/**
 * VelaraPay wordmark + glyph. The glyph is a stylised "V" inside a
 * gradient rounded square.
 */
export function Brand({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-5 shadow-md shadow-primary/20">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M5 5l7 14 7-14"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight">
          Velara<span className="text-primary">Pay</span>
        </span>
      )}
    </div>
  );
}
