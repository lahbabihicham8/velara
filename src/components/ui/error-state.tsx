import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

/**
 * Inline error surface for failed data loads inside a page region.
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-negative/12 text-negative">
        <AlertTriangle className="size-6" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {message && (
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        )}
      </div>
      {action}
    </Card>
  );
}
