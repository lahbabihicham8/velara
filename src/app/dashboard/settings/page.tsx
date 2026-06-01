import { Building2, Shield, Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { getSessionUser, authorize } from "@/services/auth.service";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [session, auth] = await Promise.all([
    getSessionUser(),
    authorize("settings.manage"),
  ]);

  if (!session.ok) {
    return <ErrorState title="Couldn't load settings" message={session.error.message} />;
  }
  if (!auth.ok || !auth.data.allowed) {
    return (
      <>
        <PageHeader title="Settings" />
        <ErrorState
          title="Access restricted"
          message="Only owners and admins can manage organisation settings."
        />
      </>
    );
  }

  const user = session.data;

  return (
    <>
      <PageHeader
        title="Settings"
        description="Organisation profile, security and preferences."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" /> Organisation
            </CardTitle>
            <CardDescription>Company profile and base currency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company name</label>
              <Input defaultValue={user.company} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Primary contact</label>
              <Input defaultValue={user.email} />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
              <span className="text-sm">Base reporting currency</span>
              <Badge variant="primary">🇺🇸 USD</Badge>
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-4 text-positive" /> Security
            </CardTitle>
            <CardDescription>Protect your treasury operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Two-factor authentication", desc: "Required for all members", on: true },
              { label: "Payment approval threshold", desc: "Dual-approval above $50,000", on: true },
              { label: "IP allowlist", desc: "Restrict access by network", on: false },
              { label: "Session timeout", desc: "Auto-logout after 30 min idle", on: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.desc}</p>
                </div>
                <Badge variant={row.on ? "positive" : "default"}>
                  {row.on ? "Enabled" : "Off"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <AppearanceCard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-info" /> Notifications
            </CardTitle>
            <CardDescription>Choose what we alert you about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Large incoming payments",
              "Failed transactions",
              "FX rate alerts",
              "Weekly treasury digest",
            ].map((label, i) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <span className="text-sm">{label}</span>
                <Badge variant={i % 3 === 2 ? "default" : "positive"}>
                  {i % 3 === 2 ? "Off" : "On"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
