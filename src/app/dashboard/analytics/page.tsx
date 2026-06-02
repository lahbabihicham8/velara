import { redirect } from "next/navigation";

/**
 * Analytics has moved to the back office (platform admins view it per client
 * account at /admin/accounts/[orgId]). The client-facing route now redirects
 * to the dashboard overview, which still surfaces headline cash-flow charts.
 */
export default function AnalyticsPage() {
  redirect("/dashboard");
}
