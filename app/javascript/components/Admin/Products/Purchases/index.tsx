import * as React from "react";
import { cast } from "ts-safe-cast";

import { useLazyPaginatedFetch } from "$app/hooks/useLazyFetch";
import { assertResponseError, request, ResponseError } from "$app/utils/request";

import { showAlert } from "$app/components/server-components/Alert";

import AdminProductPurchasesContent from "./Content";
import { type ProductPurchase } from "./Purchase";

type MassRefundResponse = {
  success: boolean;
  message?: string | null;
};

type AdminProductPurchasesProps = {
  productId: number;
  isAffiliateUser?: boolean;
  userId: number | null;
};

const AdminProductPurchases = ({ productId, isAffiliateUser = false, userId }: AdminProductPurchasesProps) => {
  const [open, setOpen] = React.useState(false);
  const [selectedPurchaseIds, setSelectedPurchaseIds] = React.useState<Set<number>>(() => new Set());
  const [isMassRefunding, setIsMassRefunding] = React.useState(false);

  const url =
    userId && isAffiliateUser
      ? Routes.admin_affiliate_product_purchases_path(userId, productId, { format: "json" })
      : Routes.admin_product_purchases_path(productId, { format: "json" });

  const {
    data: purchases,
    isLoading,
    fetchNextPage,
    hasMore,
  } = useLazyPaginatedFetch<ProductPurchase[]>([], {
    fetchUnlessLoaded: open,
    url,
    responseParser: (data) => {
      const parsed = cast<{ purchases: ProductPurchase[] }>(data);
      return parsed.purchases;
    },
    mode: "append",
  });

  React.useEffect(() => {
    if (!open) {
      setSelectedPurchaseIds(new Set());
    }
  }, [open]);

  React.useEffect(() => {
    setSelectedPurchaseIds((prev) => {
      const allowedIds = new Set(purchases.map((purchase) => purchase.id));
      const next = new Set<number>();
      prev.forEach((id) => {
        if (allowedIds.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [purchases]);

  const togglePurchaseSelection = React.useCallback((purchaseId: number, selected: boolean) => {
    setSelectedPurchaseIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(purchaseId);
      } else {
        next.delete(purchaseId);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => setSelectedPurchaseIds(new Set()), []);

  const handleMassRefund = React.useCallback(async () => {
    const selectionCount = selectedPurchaseIds.size;
    if (selectionCount === 0 || isMassRefunding) return;
    const confirmMessage = `Are you sure you want to refund ${selectionCount} ${
      selectionCount === 1 ? "purchase" : "purchases"
    } for fraud and block the buyers?`;
    // eslint-disable-next-line no-alert
    if (!confirm(confirmMessage)) {
      return;
    }

    const csrfToken = cast<string>($("meta[name=csrf-token]").attr("content"));
    const purchaseIds = Array.from(selectedPurchaseIds);

    setIsMassRefunding(true);

    try {
      const response = await request({
        url: Routes.mass_refund_for_fraud_admin_product_purchases_path(productId, { format: "json" }),
        method: "POST",
        accept: "json",
        data: {
          authenticity_token: csrfToken,
          purchase_ids: purchaseIds,
        },
      });

      const body = cast<MassRefundResponse>(await response.json());
      if (!response.ok || !body.success) {
        throw new ResponseError(body.message ?? "Something went wrong.");
      }

      showAlert(body.message ?? "Mass fraud refund started.", "success");
      setSelectedPurchaseIds(new Set());
    } catch (error) {
      assertResponseError(error);
      showAlert(error.message, "error");
    } finally {
      setIsMassRefunding(false);
    }
  }, [isMassRefunding, productId, selectedPurchaseIds]);

  return (
    <>
      <hr />
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>
          <h3>{isAffiliateUser ? "Affiliate purchases" : "Purchases"}</h3>
        </summary>
        <AdminProductPurchasesContent
          purchases={purchases}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={() => void fetchNextPage()}
          selectedPurchaseIds={selectedPurchaseIds}
          onToggleSelection={togglePurchaseSelection}
          onMassRefund={() => {
            void handleMassRefund();
          }}
          onClearSelection={clearSelection}
          isMassRefunding={isMassRefunding}
        />
      </details>
    </>
  );
};

export default AdminProductPurchases;
