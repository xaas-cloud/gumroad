import * as React from "react";
import { usePage } from "@inertiajs/react";

import CollaboratorForm from "$app/components/Collaborators/Form";
import type { EditCollaboratorFormData } from "$app/data/collaborators";

export default function CollaboratorsEdit() {
  const { collaborator } = usePage<{ collaborator: EditCollaboratorFormData }>().props;

  return <CollaboratorForm formData={collaborator} />;
}
