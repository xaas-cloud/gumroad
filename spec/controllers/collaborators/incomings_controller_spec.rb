# frozen_string_literal: true

require "spec_helper"
require "shared_examples/sellers_base_controller_concern"
require "inertia_rails/rspec"

describe Collaborators::IncomingsController, inertia: true do
  it_behaves_like "inherits from Sellers::BaseController"

  let(:seller) { create(:user) }

  describe "GET index" do
    before do
      sign_in seller
    end

    it "renders the incomings index template with props" do
      get :index
      expect(response).to be_successful
      expect(inertia.component).to eq("Collaborators/Incomings/Index")
      expect(inertia.props[:collaborators]).to eq([])
      expect(inertia.props[:collaborators_disabled_reason]).to be_nil
    end

    context "with incoming collaborators" do
      let(:other_seller) { create(:user) }
      let!(:collaborator) { create(:collaborator, seller: other_seller, affiliate_user: seller) }

      it "includes the incoming collaborator in props" do
        get :index
        expect(response).to be_successful

        expected_collaborator = inertia.props[:collaborators].first
        expect(expected_collaborator[:id]).to eq(collaborator.external_id)
        expect(expected_collaborator[:seller_email]).to eq(other_seller.email)
        expect(expected_collaborator[:seller_name]).to eq(other_seller.display_name(prefer_email_over_default_username: true))
        expect(expected_collaborator[:apply_to_all_products]).to eq(collaborator.apply_to_all_products)
        expect(expected_collaborator[:affiliate_percentage]).to eq(collaborator.affiliate_percentage)
      end
    end
  end
end
