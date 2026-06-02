import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { SessionProvider } from "@/components/providers/session-provider";
import { getCurrentUser } from "@/server/auth";
import { impersonatedOrgId } from "@/server/context";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/types";

/**
 * Authenticated dashboard layout. Validates the session against the database
 * (single source of truth) and redirects to /login when absent or expired.
 * The resolved user hydrates the client-side RBAC context.
 *
 * When a superadmin is "viewing as" a client, the session presented to the UI
 * is rebound to the impersonated org (name + margin) and a banner is shown.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let sessionUser: SessionUser = user;
  let viewingAs: string | null = null;

  const impOrg = await impersonatedOrgId(user);
  if (impOrg) {
    const org = await prisma.organization.findUnique({
      where: { id: impOrg },
      select: { name: true, marginBps: true },
    });
    if (org) {
      viewingAs = org.name;
      sessionUser = { ...user, company: org.name, marginBps: org.marginBps };
    }
  }

  return (
    <SessionProvider user={sessionUser}>
      <AppShell
        banner={viewingAs ? <ImpersonationBanner company={viewingAs} /> : undefined}
      >
        {children}
      </AppShell>
    </SessionProvider>
  );
}
