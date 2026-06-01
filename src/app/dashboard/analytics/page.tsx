import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { VolumeChart } from "@/components/charts/volume-chart";
import { ExposureDonut } from "@/components/charts/exposure-donut";
import { FxRiskPanel } from "@/components/dashboard/fx-risk-panel";
import { LiveRatesBoard } from "@/components/analytics/live-rates-board";
import { getDashboardSnapshot } from "@/services/portfolio.service";
import { authorize } from "@/services/auth.service";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const auth = await authorize("analytics.view");
  if (!auth.ok || !auth.data.allowed) {
    return (
      <>
        <PageHeader title="Smart Analytics" />
        <ErrorState
          title="Access restricted"
          message="Your role doesn't have access to analytics."
        />
      </>
    );
  }

  const snapshot = await getDashboardSnapshot();
  if (!snapshot.ok) {
    return <ErrorState title="Couldn't load analytics" message={snapshot.error.message} />;
  }

  const { cashflow, volume, exposure, risk, totalBaseValue } = snapshot.data;

  return (
    <>
      <PageHeader
        title="Smart Analytics"
        description="Cash-flow intelligence, transaction volume and FX risk insights."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LiveRatesBoard />
        <FxRiskPanel risk={risk} />
        <Card>
          <CardHeader>
            <CardTitle>Currency Exposure</CardTitle>
            <CardDescription>Portfolio allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <ExposureDonut data={exposure} total={totalBaseValue} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>Monthly inflow vs. outflow</CardDescription>
          </CardHeader>
          <CardContent>
            <CashflowChart data={cashflow} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Daily processed value (30d)</CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeChart data={volume} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
