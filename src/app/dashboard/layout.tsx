import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { getCurrentUser } from "@/server/auth";

/**
 * Authenticated dashboard layout. Validates the session against the database
 * (single source of truth) and redirects to /login when absent or expired.
 * The resolved user hydrates the client-side RBAC context.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <SessionProvider user={user}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
