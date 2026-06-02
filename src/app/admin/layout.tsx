import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import { getCurrentUser } from "@/server/auth";

/**
 * Back-office layout. Only platform superadmins may enter; everyone else is
 * sent back to their own dashboard.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isSuperadmin) redirect("/dashboard");

  return (
    <SessionProvider user={user}>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
