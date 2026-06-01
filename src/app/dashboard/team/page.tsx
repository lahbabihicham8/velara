import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { TeamTable } from "@/components/team/team-table";
import { RoleMatrix } from "@/components/team/role-matrix";
import { listTeamMembers } from "@/services/team.service";

export const metadata = { title: "Team & Roles" };

export default async function TeamPage() {
  const result = await listTeamMembers();
  if (!result.ok) {
    return <ErrorState title="Couldn't load team" message={result.error.message} />;
  }

  return (
    <>
      <PageHeader
        title="Team & Access Control"
        description="Manage members and the role-based permissions that secure your operations."
        actions={
          <Button size="sm">
            <UserPlus /> Invite member
          </Button>
        }
      />
      <div className="space-y-6">
        <TeamTable members={result.data} />
        <RoleMatrix />
      </div>
    </>
  );
}
