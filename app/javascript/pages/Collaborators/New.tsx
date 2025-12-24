import * as React from "react";
import { usePage } from "@inertiajs/react";

import CollaboratorForm from "$app/components/Collaborators/Form";
import type { NewCollaboratorFormData } from "$app/data/collaborators";

export default function CollaboratorsNew() {
  const formData = usePage<NewCollaboratorFormData>().props;

  return <CollaboratorForm formData={formData} />;
}
