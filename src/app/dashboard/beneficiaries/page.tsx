import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { BeneficiaryTable } from "@/components/beneficiaries/beneficiary-table";
import { AddBeneficiary } from "@/components/beneficiaries/add-beneficiary";
import { listBeneficiaries } from "@/services/beneficiary.service";
import { authorize } from "@/services/auth.service";

export const metadata = { title: "Beneficiaries" };

export default async function BeneficiariesPage() {
  const [result, manageAuth] = await Promise.all([
    listBeneficiaries(),
    authorize("beneficiaries.manage"),
  ]);

  if (!result.ok) {
    return (
      <ErrorState title="Couldn't load beneficiaries" message={result.error.message} />
    );
  }

  const canManage = manageAuth.ok && manageAuth.data.allowed;

  return (
    <>
      <PageHeader
        title="Beneficiaries"
        description="Saved bank details of the payees your business sends funds to."
        actions={canManage ? <AddBeneficiary /> : undefined}
      />
      <BeneficiaryTable beneficiaries={result.data} canManage={canManage} />
    </>
  );
}
