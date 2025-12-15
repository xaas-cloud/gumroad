import { router } from "@inertiajs/react";
import cx from "classnames";
import * as React from "react";

import { isValidEmail } from "$app/utils/email";

import { Button } from "$app/components/Button";
import { Layout } from "$app/components/Collaborators/Layout";
import { Icon } from "$app/components/Icons";
import { Modal } from "$app/components/Modal";
import { NumberInput } from "$app/components/NumberInput";
import { NavigationButtonInertia } from "$app/components/NavigationButton";
import { showAlert } from "$app/components/server-components/Alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "$app/components/ui/Table";
import { WithTooltip } from "$app/components/WithTooltip";

const DEFAULT_PERCENT_COMMISSION = 50;
const MIN_PERCENT_COMMISSION = 1;
const MAX_PERCENT_COMMISSION = 50;
const MAX_PRODUCTS_WITH_AFFILIATES_TO_SHOW = 10;

const validCommission = (percentCommission: number | null) =>
  percentCommission !== null &&
  percentCommission >= MIN_PERCENT_COMMISSION &&
  percentCommission <= MAX_PERCENT_COMMISSION;

export type CollaboratorFormProduct = {
  id: string;
  name: string;
  has_another_collaborator: boolean;
  has_affiliates: boolean;
  published: boolean;
  enabled: boolean;
  percent_commission: number | null;
  dont_show_as_co_creator: boolean;
};

type NewCollaboratorFormData = {
  products: CollaboratorFormProduct[];
  collaborators_disabled_reason: string | null;
};

type EditCollaboratorFormData = NewCollaboratorFormData & {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  apply_to_all_products: boolean;
  dont_show_as_co_creator: boolean;
  percent_commission: number | null;
  setup_incomplete: boolean;
};

export type CollaboratorFormData = NewCollaboratorFormData | EditCollaboratorFormData;

type CollaboratorProduct = CollaboratorFormProduct & {
  has_error: boolean;
};

type Props = {
  formData: CollaboratorFormData;
};

const CollaboratorForm = ({ formData }: Props) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const isEditing = "id" in formData;

  const hasEnabledUnpublishedOrIneligibleProducts =
    isEditing &&
    formData.products.some((product) => product.enabled && (!product.published || product.has_another_collaborator));

  const [showIneligibleProducts, setShowIneligibleProducts] = React.useState(hasEnabledUnpublishedOrIneligibleProducts);
  const [collaboratorEmail, setCollaboratorEmail] = React.useState<{ value: string; error?: string }>({
    value: "",
  });

  const [applyToAllProducts, setApplyToAllProducts] = React.useState(isEditing ? formData.apply_to_all_products : true);
  const [defaultPercentCommission, setDefaultPercentCommission] = React.useState<{
    value: number | null;
    hasError: boolean;
  }>({
    value: isEditing ? formData.percent_commission || DEFAULT_PERCENT_COMMISSION : DEFAULT_PERCENT_COMMISSION,
    hasError: false,
  });
  const [dontShowAsCoCreator, setDontShowAsCoCreator] = React.useState(
    isEditing ? formData.dont_show_as_co_creator : false,
  );

  const shouldEnableProduct = (product: CollaboratorFormProduct) => {
    if (product.has_another_collaborator) return false;
    return showIneligibleProducts || product.published;
  };

  const shouldShowProduct = (product: CollaboratorFormProduct) => {
    if (showIneligibleProducts) return true;
    return !product.has_another_collaborator && product.published;
  };

  const [products, setProducts] = React.useState<CollaboratorProduct[]>(() =>
    formData.products.map((product) =>
      isEditing
        ? {
            ...product,
            percent_commission: product.percent_commission || defaultPercentCommission.value,
            dont_show_as_co_creator: applyToAllProducts ? dontShowAsCoCreator : product.dont_show_as_co_creator,
            has_error: false,
          }
        : {
            ...product,
            enabled: shouldEnableProduct(product),
            percent_commission: defaultPercentCommission.value,
            has_error: false,
          },
    ),
  );

  const productsWithAffiliates = products.filter((product) => product.enabled && product.has_affiliates);
  const listedProductsWithAffiliatesCount =
    productsWithAffiliates.length <= MAX_PRODUCTS_WITH_AFFILIATES_TO_SHOW + 1
      ? productsWithAffiliates.length
      : MAX_PRODUCTS_WITH_AFFILIATES_TO_SHOW;

  const handleProductChange = (id: string, attrs: Partial<CollaboratorProduct>) => {
    setProducts((prevProducts) =>
      prevProducts.map((item) => (item.id === id ? { ...item, ...attrs, has_error: false } : item)),
    );
  };

  const handleDefaultCommissionChange = (percent_commission: number | null) => {
    setDefaultPercentCommission({ value: percent_commission, hasError: false });
    setProducts((prevProducts) => prevProducts.map((item) => ({ ...item, percent_commission, has_error: false })));
  };

  const handleSubmit = () => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        has_error: product.enabled && !applyToAllProducts && !validCommission(product.percent_commission),
      })),
    );
    setDefaultPercentCommission({
      ...defaultPercentCommission,
      hasError: applyToAllProducts && !validCommission(defaultPercentCommission.value),
    });

    if (!isEditing) {
      const emailError =
        collaboratorEmail.value.length === 0
          ? "Collaborator email must be provided"
          : !isValidEmail(collaboratorEmail.value)
            ? "Please enter a valid email"
            : null;
      setCollaboratorEmail(
        emailError ? { value: collaboratorEmail.value, error: emailError } : { value: collaboratorEmail.value },
      );
      if (emailError) {
        showAlert(emailError, "error");
        emailInputRef.current?.focus();
        return;
      }
    }

    const enabledProducts = products.flatMap(({ id, enabled, percent_commission, dont_show_as_co_creator }) =>
      enabled ? { id, percent_commission, dont_show_as_co_creator } : [],
    );

    if (enabledProducts.length === 0) {
      showAlert("At least one product must be selected", "error");
      return;
    }

    if (
      defaultPercentCommission.hasError ||
      enabledProducts.some((product) => !validCommission(product.percent_commission))
    ) {
      showAlert("Collaborator cut must be 50% or less", "error");
      return;
    }

    if (products.some((product) => product.enabled && product.has_affiliates) && !isConfirmed) {
      setIsConfirmationModalOpen(true);
      return;
    }

    setIsSaving(true);
    const data = {
      collaborator: {
        apply_to_all_products: applyToAllProducts,
        percent_commission: defaultPercentCommission.value,
        products: enabledProducts,
        dont_show_as_co_creator: dontShowAsCoCreator,
        ...(!isEditing && { email: collaboratorEmail.value }),
      },
    };

    if (isEditing) {
      router.patch(Routes.collaborator_path(formData.id), data, {
        onSuccess: () => {
          showAlert("Changes saved!", "success");
        },
        onError: (errors) => {
          showAlert(errors.base?.[0] || "Failed to update collaborator", "error");
        },
        onFinish: () => setIsSaving(false),
      });
    } else {
      router.post(Routes.collaborators_path(), data, {
        onSuccess: () => {
          showAlert("Collaborator added!", "success");
        },
        onError: (errors) => {
          showAlert(errors.base?.[0] || "Failed to add collaborator", "error");
        },
        onFinish: () => setIsSaving(false),
      });
    }
  };

  React.useEffect(() => {
    if (!isConfirmed) return;
    handleSubmit();
  }, [isConfirmed]);

  return (
    <Layout
      title={isEditing ? formData.name : "New collaborator"}
      headerActions={
        <>
          <NavigationButtonInertia href={Routes.collaborators_path()}>
            <Icon name="x-square" />
            Cancel
          </NavigationButtonInertia>
          <WithTooltip position="bottom" tip={formData.collaborators_disabled_reason}>
            <Button
              color="accent"
              onClick={handleSubmit}
              disabled={formData.collaborators_disabled_reason !== null || isSaving}
            >
              {isSaving ? "Saving..." : isEditing ? "Save changes" : "Add collaborator"}
            </Button>
          </WithTooltip>
        </>
      }
    >
      <form>
        <section className="p-8!">
          <header>
            {isEditing ? <h2>Products</h2> : null}
            <div>Collaborators will receive a cut from the revenue generated by the selected products.</div>
            <a href="/help/article/341-collaborations" target="_blank" rel="noreferrer">
              Learn more
            </a>
          </header>
          {!isEditing ? (
            <fieldset className={cx({ danger: collaboratorEmail.error })}>
              <legend>
                <label htmlFor="email">Email</label>
              </legend>

              <div className="input">
                <input
                  ref={emailInputRef}
                  id="email"
                  type="email"
                  value={collaboratorEmail.value}
                  placeholder="Collaborator's Gumroad account email"
                  onChange={(e) => setCollaboratorEmail({ value: e.target.value.trim() })}
                />
              </div>
            </fieldset>
          ) : null}
          <fieldset>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Enable</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Cut</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <input
                      id="all-products-cut"
                      type="checkbox"
                      role="switch"
                      checked={applyToAllProducts}
                      onChange={(evt) => {
                        const enabled = evt.target.checked;
                        setApplyToAllProducts(enabled);
                        setProducts((prevProducts) =>
                          prevProducts.map((item) => (shouldEnableProduct(item) ? { ...item, enabled } : item)),
                        );
                      }}
                      aria-label="All products"
                    />
                  </TableCell>
                  <TableCell>
                    <label htmlFor="all-products-cut">All products</label>
                  </TableCell>
                  <TableCell>
                    <fieldset className={cx({ danger: defaultPercentCommission.hasError })}>
                      <NumberInput value={defaultPercentCommission.value} onChange={handleDefaultCommissionChange}>
                        {(inputProps) => (
                          <div className={cx("input", { disabled: !applyToAllProducts })}>
                            <input
                              type="text"
                              disabled={!applyToAllProducts}
                              placeholder={`${defaultPercentCommission.value || DEFAULT_PERCENT_COMMISSION}`}
                              aria-label="Percentage"
                              {...inputProps}
                            />
                            <div className="pill">%</div>
                          </div>
                        )}
                      </NumberInput>
                    </fieldset>
                  </TableCell>
                  <TableCell>
                    <label>
                      <input
                        type="checkbox"
                        checked={!dontShowAsCoCreator}
                        onChange={(evt) => {
                          const value = !evt.target.checked;
                          setDontShowAsCoCreator(value);
                          setProducts((prevProducts) =>
                            prevProducts.map((item) => ({ ...item, dont_show_as_co_creator: value, has_error: false })),
                          );
                        }}
                        disabled={!applyToAllProducts}
                      />
                      Show as co-creator
                    </label>
                  </TableCell>
                </TableRow>
                {products.map((product) => {
                  const disabled = applyToAllProducts || !product.enabled;

                  return shouldShowProduct(product) ? (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          id={`enable-product-${product.id}`}
                          type="checkbox"
                          role="switch"
                          disabled={product.has_another_collaborator}
                          checked={product.enabled}
                          onChange={(evt) => handleProductChange(product.id, { enabled: evt.target.checked })}
                          aria-label="Enable all products"
                        />
                      </TableCell>
                      <TableCell>
                        <label htmlFor={`enable-product-${product.id}`}>{product.name}</label>
                        {product.has_another_collaborator || product.has_affiliates ? (
                          <small>
                            {product.has_another_collaborator
                              ? "Already has a collaborator"
                              : "Selecting this product will remove all its affiliates."}
                          </small>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <fieldset className={cx({ danger: product.has_error })}>
                          <NumberInput
                            value={product.percent_commission}
                            onChange={(value) => handleProductChange(product.id, { percent_commission: value })}
                          >
                            {(inputProps) => (
                              <div className={cx("input", { disabled })}>
                                <input
                                  disabled={disabled}
                                  type="text"
                                  placeholder={`${defaultPercentCommission.value || DEFAULT_PERCENT_COMMISSION}`}
                                  aria-label="Percentage"
                                  {...inputProps}
                                />
                                <div className="pill">%</div>
                              </div>
                            )}
                          </NumberInput>
                        </fieldset>
                      </TableCell>
                      <TableCell>
                        <label>
                          <input
                            type="checkbox"
                            checked={!product.dont_show_as_co_creator}
                            onChange={(evt) =>
                              handleProductChange(product.id, { dont_show_as_co_creator: !evt.target.checked })
                            }
                            disabled={disabled}
                          />
                          Show as co-creator
                        </label>
                      </TableCell>
                    </TableRow>
                  ) : null;
                })}
              </TableBody>
            </Table>
          </fieldset>
          <label>
            <input
              type="checkbox"
              checked={showIneligibleProducts}
              onChange={(evt) => {
                const enabled = evt.target.checked;
                setShowIneligibleProducts(enabled);
                if (applyToAllProducts) {
                  setProducts((prevProducts) =>
                    prevProducts.map((item) =>
                      !item.has_another_collaborator && enabled && !item.published ? { ...item, enabled } : item,
                    ),
                  );
                }
              }}
            />
            Show unpublished and ineligible products
          </label>
        </section>
        <Modal
          open={isConfirmationModalOpen}
          title="Remove affiliates?"
          onClose={() => setIsConfirmationModalOpen(false)}
        >
          <h4 className="mb-3">
            Affiliates will be removed from the following products:
            <ul>
              {productsWithAffiliates.slice(0, listedProductsWithAffiliatesCount).map((product) => (
                <li key={product.id}>{product.name}</li>
              ))}
            </ul>
            {listedProductsWithAffiliatesCount < productsWithAffiliates.length ? (
              <span>{`and ${productsWithAffiliates.length - listedProductsWithAffiliatesCount} others.`}</span>
            ) : null}
          </h4>
          <div className="flex justify-between gap-3">
            <Button className="grow" onClick={() => setIsConfirmationModalOpen(false)}>
              No, cancel
            </Button>
            <Button
              color="primary"
              className="grow"
              onClick={() => {
                setIsConfirmationModalOpen(false);
                setIsConfirmed(true);
              }}
            >
              Yes, continue
            </Button>
          </div>
        </Modal>
      </form>
    </Layout>
  );
};

export default CollaboratorForm;
