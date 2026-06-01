import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Friendly empty placeholder for filtered lists with no results.
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {message && (
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        )}
      </div>
      {action}
    </div>
  );
}
