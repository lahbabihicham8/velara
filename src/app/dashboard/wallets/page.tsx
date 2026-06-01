import { Plus, Wallet as WalletIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Delta } from "@/components/ui/delta";
import { ErrorState } from "@/components/ui/error-state";
import { WalletCard } from "@/components/wallets/wallet-card";
import { CurrencyConverter } from "@/components/wallets/currency-converter";
import { formatMoney } from "@/lib/format";
import { listWallets } from "@/services/wallet.service";
import { authorize } from "@/services/auth.service";

export const metadata = { title: "Wallets" };

export default async function WalletsPage() {
  const [view, convertAuth] = await Promise.all([
    listWallets(),
    authorize("wallets.convert"),
  ]);

  if (!view.ok) {
    return <ErrorState title="Couldn't load wallets" message={view.error.message} />;
  }

  const { wallets, totalBaseValue } = view.data;
  const canConvert = convertAuth.ok && convertAuth.data.allowed;

  return (
    <>
      <PageHeader
        title="Multi-Currency Wallets"
        description="Hold, manage and convert across 7 currencies in real time."
        actions={
          <Button size="sm">
            <Plus /> Add currency
          </Button>
        }
      />

      <Card className="mb-6 overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card">
        <CardContent className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
              <WalletIcon className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total portfolio value</p>
              <p className="text-3xl font-bold tracking-tight tnum">
                {formatMoney(totalBaseValue, "USD")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            24h change <Delta value={0.0061} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {wallets.map((wallet, i) => (
              <WalletCard key={wallet.id} wallet={wallet} index={i} />
            ))}
          </div>
        </div>

        <div className="xl:col-span-1">
          {canConvert ? (
            <CurrencyConverter />
          ) : (
            <ErrorState
              title="Conversion restricted"
              message="Your role doesn't permit currency conversion. Contact a treasurer or admin."
            />
          )}
        </div>
      </div>
    </>
  );
}
