import { usePage } from "@inertiajs/react";
import React from "react";
import { cast } from "ts-safe-cast";

import { default as AdvancedPageComponent, type AdvancedPageProps } from "$app/components/Settings/AdvancedPage";

export default function AdvancedPage() {
  const props = cast<AdvancedPageProps>(usePage().props);

  return <AdvancedPageComponent {...props} />;
}
