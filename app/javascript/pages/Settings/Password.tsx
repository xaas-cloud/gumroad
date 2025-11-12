import { usePage } from "@inertiajs/react";
import React from "react";
import { cast } from "ts-safe-cast";

import { default as PasswordPageComponent, type PasswordPageProps } from "$app/components/Settings/PasswordPage";

export default function PasswordPage() {
  const props = cast<PasswordPageProps>(usePage().props);

  return <PasswordPageComponent {...props} />;
}
