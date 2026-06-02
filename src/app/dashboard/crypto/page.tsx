import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { CryptoHoldings } from "@/components/crypto/crypto-holdings";
import { listCrypto } from "@/services/crypto.service";

export const metadata = { title: "Crypto" };

export default async function CryptoPage() {
  const view = await listCrypto();

  if (!view.ok) {
    return <ErrorState title="Couldn't load crypto" message={view.error.message} />;
  }

  return (
    <>
      <PageHeader
        title="Crypto Wallets"
        description="Track digital asset holdings, re-valued against a live USD price feed."
      />
      <CryptoHoldings holdings={view.data.holdings} />
    </>
  );
}
