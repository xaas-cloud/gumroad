# frozen_string_literal: true

class MassRefundForFraudJob
  include Sidekiq::Job
  sidekiq_options retry: 1, queue: :default, lock: :until_executed

  def perform(product_id, purchase_ids, admin_user_id)
    results = { success: 0, failed: 0, errors: {} }

    purchase_ids.each do |purchase_id|
      purchase = Purchase.find_by(id: purchase_id, link_id: product_id)
      unless purchase
        results[:failed] += 1
        results[:errors][purchase_id] = "Purchase not found"
        next
      end

      begin
        purchase.refund_for_fraud_and_block_buyer!(admin_user_id)
        results[:success] += 1
      rescue StandardError => e
        results[:failed] += 1
        results[:errors][purchase_id] = e.message
        Rails.logger.error("Mass fraud refund failed for purchase #{purchase_id}: #{e.class}: #{e.message}")
      end
    end

    Rails.logger.info("Mass fraud refund completed for product #{product_id}: #{results[:success]} succeeded, #{results[:failed]} failed")
  end
end

