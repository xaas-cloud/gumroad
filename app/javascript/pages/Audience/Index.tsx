import { usePage } from "@inertiajs/react";
import React from "react";

import { AudiencePageContent } from "$app/components/Audience/AudiencePageContent";

function Audience() {
  const { total_follower_count } = usePage<{ total_follower_count: number }>().props;

  return <AudiencePageContent total_follower_count={total_follower_count} />;
}

export default Audience;
