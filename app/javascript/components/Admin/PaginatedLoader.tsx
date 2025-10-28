import { WhenVisible } from "@inertiajs/react";
import React from "react";

import { LoadingSpinner } from "$app/components/LoadingSpinner";
import { type CountlessPagination } from "$app/hooks/useLazyFetch";

type PaginatedLoaderProps = {
  itemsLength: number;
  pagination: CountlessPagination;
  only: string[];
};

const PaginatedLoader = ({ itemsLength, pagination, only }: PaginatedLoaderProps) => {
  const expectedItemsUpToCurrentPage = pagination.page * pagination.limit;
  const hasFullPage = itemsLength >= expectedItemsUpToCurrentPage;

  if (!hasFullPage) return null;

  const params = {
    data: { page: pagination.page + 1 },
    only,
    preserveScroll: true,
    preserveUrl: true,
  };

  return (
    <WhenVisible key={`${pagination.page}-${pagination.limit}`} fallback={<LoadingSpinner />} params={params}>
      <div />
    </WhenVisible>
  );
};

export default PaginatedLoader;
