import Link from "next/link";
import { ArrowRight, Building2, Eye, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { formatMoney } from "@/lib/format";
import { formatMargin } from "@/lib/margin";
import { listAccounts } from "@/services/admin.service";
import { viewAsAction } from "@/server/actions/admin-actions";

export const metadata = { title: "Accounts · Back office" };

export default async function AdminAccountsPage() {
  const res = await listAccounts();
  if (!res.ok) {
    return <ErrorState title="Couldn't load accounts" message={res.error.message} />;
  }

  const accounts = res.data;
  const totalAum = accounts.reduce((s, a) => s + a.totalBaseValue, 0);

  return (
    <>
      <PageHeader
        title="Client Accounts"
        description="Every organisation on the platform. Open an account to inspect it or adjust its trading margin."
      />

      <Card className="mb-6 bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="flex flex-wrap items-center gap-8 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Accounts under management</p>
            <p className="text-3xl font-bold tracking-tight tnum">{accounts.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total assets (USD)</p>
            <p className="text-3xl font-bold tracking-tight tnum">
              {formatMoney(totalAum, "USD", { compact: true })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <Card key={a.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Building2 className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Base {a.baseCurrency}
                  </p>
                </div>
              </div>
              <Badge variant="primary">{formatMargin(a.marginBps)}</Badge>
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Total value</p>
              <p className="text-2xl font-bold tracking-tight tnum">
                {formatMoney(a.totalBaseValue, "USD", { compact: true })}
              </p>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {a.userCount}
              </span>
              <span className="flex items-center gap-1">
                <Wallet className="size-3.5" /> {a.walletCount}
              </span>
              <span>{a.transactionCount} txns</span>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <Link href={`/admin/accounts/${a.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Open <ArrowRight />
                </Button>
              </Link>
              <form action={viewAsAction}>
                <input type="hidden" name="orgId" value={a.id} />
                <Button type="submit" size="sm" variant="secondary">
                  <Eye /> View as
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
