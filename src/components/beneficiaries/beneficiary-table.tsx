import { Trash2, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteBeneficiaryAction } from "@/server/actions/beneficiary-actions";
import type { Beneficiary } from "@/types";

/**
 * Read view of saved beneficiaries with an optional delete action (when the
 * viewer holds `beneficiaries.manage`). Server component — the delete control
 * is a form posting directly to the server action.
 */
export function BeneficiaryTable({
  beneficiaries,
  canManage,
}: {
  beneficiaries: Beneficiary[];
  canManage: boolean;
}) {
  if (beneficiaries.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No beneficiaries yet"
        message="Add a payee's bank details to send payments quickly."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Beneficiary</th>
              <th className="px-4 py-2.5 font-medium">Bank</th>
              <th className="px-4 py-2.5 font-medium">Account / IBAN</th>
              <th className="px-4 py-2.5 font-medium">SWIFT</th>
              <th className="px-4 py-2.5 font-medium">Currency</th>
              {canManage && <th className="px-4 py-2.5 text-right font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map((b) => (
              <tr key={b.id} className="border-b border-border/60 transition-colors hover:bg-muted/40">
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {b.countryFlag} {b.name}
                  </p>
                  {b.nickname && (
                    <p className="text-xs text-muted-foreground">{b.nickname}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p>{b.bankName}</p>
                  <p className="text-xs text-muted-foreground">{b.country}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{b.iban ?? b.accountNumber}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {b.swift}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{b.currency}</Badge>
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <form action={deleteBeneficiaryAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        aria-label={`Delete ${b.name}`}
                        className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-negative/10 hover:text-negative"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
