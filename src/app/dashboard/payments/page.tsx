import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { BulkUpload } from "@/components/payments/bulk-upload";
import { BatchHistory } from "@/components/payments/batch-history";
import { listBatches } from "@/services/bulk-payment.service";

export const metadata = { title: "Bulk Payments" };

export default async function PaymentsPage() {
  const result = await listBatches();

  if (!result.ok) {
    return <ErrorState title="Couldn't load payments" message={result.error.message} />;
  }

  return (
    <>
      <PageHeader
        title="Bulk Payments"
        description="Upload a CSV to pay many beneficiaries in one run."
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <BulkUpload />
        </div>
        <div className="xl:col-span-2">
          <BatchHistory batches={result.data} />
        </div>
      </div>
    </>
  );
}
