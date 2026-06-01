import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { FxRiskPanel } from "@/components/dashboard/fx-risk-panel";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { ExposureDonut } from "@/components/charts/exposure-donut";
import { ErrorState } from "@/components/ui/error-state";
import { getDashboardSnapshot } from "@/services/portfolio.service";

export const metadata = { title: "Overview" };

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot.ok) {
    return <ErrorState title="Couldn't load dashboard" message={snapshot.error.message} />;
  }

  const { kpis, cashflow, exposure, risk, recentTransactions, totalBaseValue } =
    snapshot.data;

  return (
    <>
      <PageHeader
        title="Treasury Overview"
        description="Real-time view of balances, cash flow and currency risk."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download /> Export
            </Button>
            <Button size="sm">
              <Plus /> New payment
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((metric, i) => (
          <KpiCard key={metric.id} metric={metric} index={i} />
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>Inflow vs. outflow over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflow} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency Exposure</CardTitle>
            <CardDescription>Share of portfolio by currency</CardDescription>
          </CardHeader>
          <CardContent>
            <ExposureDonut data={exposure} total={totalBaseValue} />
          </CardContent>
        </Card>
      </div>

      {/* Activity + risk row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions items={recentTransactions} />
        </div>
        <FxRiskPanel risk={risk} />
      </div>
    </>
  );
}
