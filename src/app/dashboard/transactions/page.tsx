import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { listTransactions } from "@/services/transaction.service";

export const metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const result = await listTransactions(80);

  if (!result.ok) {
    return (
      <ErrorState title="Couldn't load transactions" message={result.error.message} />
    );
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every payment, conversion and fee across your organisation."
        actions={
          <Button variant="outline" size="sm">
            <Download /> Export CSV
          </Button>
        }
      />
      <TransactionsTable transactions={result.data} />
    </>
  );
}
