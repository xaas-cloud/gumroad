# frozen_string_literal: true

require "spec_helper"

describe MassRefundForFraudJob do
  let(:admin_user) { create(:admin_user) }
  let(:product) { create(:product) }

  describe "#perform" do
    let!(:purchase1) { create(:purchase, link: product) }
    let!(:purchase2) { create(:purchase, link: product) }
    let(:purchase_ids) { [purchase1.id, purchase2.id] }

    it "processes each purchase and logs results" do
      expect(purchase1).to receive(:refund_for_fraud_and_block_buyer!).with(admin_user.id)
      expect(purchase2).to receive(:refund_for_fraud_and_block_buyer!).with(admin_user.id)

      allow(Purchase).to receive(:find_by).with(id: purchase1.id, link_id: product.id).and_return(purchase1)
      allow(Purchase).to receive(:find_by).with(id: purchase2.id, link_id: product.id).and_return(purchase2)

      expect(Rails.logger).to receive(:info).with(/Mass fraud refund completed for product #{product.id}: 2 succeeded, 0 failed/)

      described_class.new.perform(product.id, purchase_ids, admin_user.id)
    end

    it "handles missing purchases gracefully" do
      missing_id = 999
      purchase_ids_with_missing = [purchase1.id, missing_id]

      expect(purchase1).to receive(:refund_for_fraud_and_block_buyer!).with(admin_user.id)

      allow(Purchase).to receive(:find_by).with(id: purchase1.id, link_id: product.id).and_return(purchase1)
      allow(Purchase).to receive(:find_by).with(id: missing_id, link_id: product.id).and_return(nil)

      expect(Rails.logger).to receive(:info).with(/Mass fraud refund completed for product #{product.id}: 1 succeeded, 1 failed/)

      described_class.new.perform(product.id, purchase_ids_with_missing, admin_user.id)
    end

    it "handles refund errors and continues processing" do
      allow(Purchase).to receive(:find_by).with(id: purchase1.id, link_id: product.id).and_return(purchase1)
      allow(Purchase).to receive(:find_by).with(id: purchase2.id, link_id: product.id).and_return(purchase2)

      expect(purchase1).to receive(:refund_for_fraud_and_block_buyer!).with(admin_user.id).and_raise(StandardError.new("Refund failed"))
      expect(purchase2).to receive(:refund_for_fraud_and_block_buyer!).with(admin_user.id)

      expect(Rails.logger).to receive(:error).with(/Mass fraud refund failed for purchase #{purchase1.id}/)
      expect(Rails.logger).to receive(:info).with(/Mass fraud refund completed for product #{product.id}: 1 succeeded, 1 failed/)

      described_class.new.perform(product.id, purchase_ids, admin_user.id)
    end
  end
end
