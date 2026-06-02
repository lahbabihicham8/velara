"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Route-level error boundary for the dashboard segment.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-10">
      <ErrorState
        title="This page hit an unexpected error"
        message={error.message || "Please try again in a moment."}
        action={
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCw /> Retry
          </Button>
        }
      />
    </div>
  );
}
