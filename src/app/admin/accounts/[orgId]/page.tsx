import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { FxRiskPanel } from "@/components/dashboard/fx-risk-panel";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { VolumeChart } from "@/components/charts/volume-chart";
import { ExposureDonut } from "@/components/charts/exposure-donut";
import { WalletCard } from "@/components/wallets/wallet-card";
import { CryptoHoldings } from "@/components/crypto/crypto-holdings";
import { BeneficiaryTable } from "@/components/beneficiaries/beneficiary-table";
import { MarginEditor } from "@/components/admin/margin-editor";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatMoney } from "@/lib/format";
import { getAccountDetail } from "@/services/admin.service";
import { viewAsAction } from "@/server/actions/admin-actions";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const res = await getAccountDetail(orgId);

  if (!res.ok) {
    return (
      <>
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to accounts
        </Link>
        <ErrorState title="Couldn't load account" message={res.error.message} />
      </>
    );
  }

  const d = res.data;

  return (
    <>
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to accounts
      </Link>

      <PageHeader
        title={d.name}
        description={`Base ${d.baseCurrency} · created ${formatDate(d.createdAt)} · read-only back-office view`}
        actions={
          <form action={viewAsAction}>
            <input type="hidden" name="orgId" value={d.id} />
            <Button type="submit" size="sm">
              <Eye /> View as client
            </Button>
          </form>
        }
      />

      {/* Margin control + headline totals */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MarginEditor orgId={d.id} current={d.marginBps} />
        <Card>
          <CardHeader>
            <CardTitle>Fiat portfolio</CardTitle>
            <CardDescription>{d.wallets.length} currency wallets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tnum">
              {formatMoney(d.totalBaseValue, "USD")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Crypto holdings</CardTitle>
            <CardDescription>{d.crypto.length} assets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight tnum">
              {formatMoney(d.cryptoBaseValue, "USD")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {d.kpis.map((metric, i) => (
          <KpiCard key={metric.id} metric={metric} index={i} />
        ))}
      </div>

      {/* Analytics (kept in the back office) */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>Inflow vs. outflow (12 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <CashflowChart data={d.cashflow} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Currency Exposure</CardTitle>
            <CardDescription>Share by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <ExposureDonut data={d.exposure} total={d.totalBaseValue} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Daily processed value (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeChart data={d.volume} />
          </CardContent>
        </Card>
        <FxRiskPanel risk={d.risk} />
      </div>

      {/* Wallets */}
      <h2 className="mb-3 mt-8 text-lg font-bold tracking-tight">Wallets</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {d.wallets.map((w, i) => (
          <WalletCard key={w.id} wallet={w} index={i} />
        ))}
      </div>

      {/* Crypto */}
      <h2 className="mb-3 mt-8 text-lg font-bold tracking-tight">Crypto</h2>
      <CryptoHoldings holdings={d.crypto} />

      {/* Beneficiaries */}
      <h2 className="mb-3 mt-8 text-lg font-bold tracking-tight">Beneficiaries</h2>
      <BeneficiaryTable beneficiaries={d.beneficiaries} canManage={false} />

      {/* Recent activity + members */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions items={d.recentTransactions} />
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Team ({d.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {d.members.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-2.5">
                  <Avatar initials={m.initials} seed={m.id} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {m.role}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
