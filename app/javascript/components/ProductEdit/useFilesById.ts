import * as React from "react";

import { FileEntry } from "$app/components/ProductEdit/state";

export const useFilesById = (files: FileEntry[]) =>
  React.useMemo(() => new Map(files.map((file) => [file.id, file])), [files]);
