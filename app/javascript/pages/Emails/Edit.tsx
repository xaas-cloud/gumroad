import { usePage } from "@inertiajs/react";
import React from "react";
import { cast } from "ts-safe-cast";

import { Installment, InstallmentFormContext } from "$app/data/installments";
import { EmailForm } from "$app/components/server-components/EmailsPage/EmailForm";
import { EmailsLayout } from "$app/components/EmailsPage/Layout";

function EmailsEdit() {
  const { installment, context } = cast<{ installment: Installment; context: InstallmentFormContext }>(
    usePage().props,
  );

  return <EmailForm context={context} installment={installment} />;
}

EmailsEdit.layout = (page: React.ReactNode) => <EmailsLayout selectedTab="drafts" hideNewButton>{page}</EmailsLayout>;

export default EmailsEdit;
