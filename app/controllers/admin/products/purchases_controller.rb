# frozen_string_literal: true

class Admin::Products::PurchasesController < Admin::Products::BaseController
  include Pagy::Backend

  def index
    pagination, purchases = pagy_countless(
      @product.sales.for_admin_listing.includes(:subscription, :price, :refunds),
      limit: params[:per_page],
      page: params[:page],
      countless_minimal: true
    )

    render json: {
      purchases: purchases.as_json(admin_review: true),
      pagination:
    }
  end

  def mass_refund_for_fraud
    purchase_ids = mass_refund_for_fraud_purchase_ids

    if purchase_ids.empty?
      render json: { success: false, message: "Select at least one purchase." }, status: :unprocessable_entity
      return
    end

    purchases_relation = @product.sales.where(id: purchase_ids)
    found_ids = purchases_relation.pluck(:id)
    missing_ids = purchase_ids - found_ids

    if missing_ids.any?
      render json: { success: false, message: "Some purchases are invalid for this product." }, status: :unprocessable_entity
      return
    end

    MassRefundForFraudJob.perform_async(@product.id, purchase_ids, current_user.id)

    render json: {
      success: true,
      message: "Processing #{purchase_ids.size} fraud refunds..."
    }
  end

  private
    def mass_refund_for_fraud_purchase_ids
      raw_ids = params[:purchase_ids]
      values =
        case raw_ids
        when String
          raw_ids.split(",")
        else
          Array(raw_ids)
        end
      values.map(&:to_i).reject(&:zero?).uniq
    end
end
