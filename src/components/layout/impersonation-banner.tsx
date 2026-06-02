import { Eye } from "lucide-react";
import { stopViewAsAction } from "@/server/actions/admin-actions";

/**
 * Shown to a superadmin who is "viewing as" a client account. Posts to the
 * server action to clear impersonation and return to the back office.
 */
export function ImpersonationBanner({ company }: { company: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-warning/15 px-4 py-2 text-center text-sm text-warning-foreground">
      <span className="flex items-center gap-2 font-medium">
        <Eye className="size-4" />
        Back office — viewing as <strong>{company}</strong>
      </span>
      <form action={stopViewAsAction}>
        <button
          type="submit"
          className="rounded-md px-2 py-0.5 text-xs font-semibold underline underline-offset-2 hover:opacity-80"
        >
          Exit to back office
        </button>
      </form>
    </div>
  );
}
