import React from "react";

import { Button } from "$app/components/Button";
import { LoadingSpinner } from "$app/components/LoadingSpinner";

import AdminProductPurchase, { ProductPurchase } from "./Purchase";

type AdminProductPurchasesContentProps = {
  purchases: ProductPurchase[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  selectedPurchaseIds: Set<number>;
  onToggleSelection: (purchaseId: number, selected: boolean) => void;
  onMassRefund: () => void;
  onClearSelection: () => void;
  isMassRefunding: boolean;
};

const AdminProductPurchasesContent = ({
  purchases,
  isLoading,
  hasMore,
  onLoadMore,
  selectedPurchaseIds,
  onToggleSelection,
  onMassRefund,
  onClearSelection,
  isMassRefunding,
}: AdminProductPurchasesContentProps) => {
  if (purchases.length === 0 && !isLoading)
    return (
      <div className="info" role="status">
        No purchases have been made.
      </div>
    );

  const selectedCount = selectedPurchaseIds.size;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="mass-refund-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          {selectedCount > 0
            ? `${selectedCount} ${selectedCount === 1 ? "purchase selected" : "purchases selected"}`
            : "Select purchases to refund for fraud"}
        </div>
        <div className="button-group">
          {selectedCount > 0 ? (
            <Button small outline onClick={onClearSelection} disabled={isMassRefunding}>
              Clear selection
            </Button>
          ) : null}
          <Button small onClick={onMassRefund} disabled={selectedCount === 0 || isMassRefunding}>
            {isMassRefunding ? "Starting..." : "Refund for Fraud"}
          </Button>
        </div>
      </div>

      <div className="stack">
        {purchases.map((purchase) => (
          <AdminProductPurchase
            key={purchase.id}
            purchase={purchase}
            isSelected={selectedPurchaseIds.has(purchase.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : null}

      {hasMore ? (
        <Button small onClick={onLoadMore} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
};

export default AdminProductPurchasesContent;
