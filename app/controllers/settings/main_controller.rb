# frozen_string_literal: true

class Settings::MainController < Settings::BaseController
  include ActiveSupport::NumberHelper

  before_action :authorize

  USER_ATTRIBUTE_KEYS = [
    :email,
    :enable_payment_email,
    :enable_payment_push_notification,
    :enable_recurring_subscription_charge_email,
    :enable_recurring_subscription_charge_push_notification,
    :enable_free_downloads_email,
    :enable_free_downloads_push_notification,
    :announcement_notification_enabled,
    :disable_comments_email,
    :disable_reviews_email,
    :support_email,
    :locale,
    :timezone,
    :currency_type,
    :purchasing_power_parity_enabled,
    :purchasing_power_parity_limit,
    :purchasing_power_parity_payment_verification_disabled,
    :show_nsfw_products,
    :disable_affiliate_requests,
  ].freeze

  def show
    @title = "Settings"

    render inertia: "Settings/Main", props: settings_presenter.main_props
  end

  def update
    user_payload = normalized_user_payload

    current_seller.with_lock do
      previous_email = current_seller.email
      current_seller.assign_attributes(user_payload.slice(*USER_ATTRIBUTE_KEYS))
      current_seller.unconfirmed_email = nil if user_payload[:email] == previous_email

      apply_refund_policy!(user_payload[:seller_refund_policy]) if current_seller.account_level_refund_policy_enabled?
      current_seller.save!
    end

    current_seller.update_purchasing_power_parity_excluded_products!(normalized_ppp_ids(user_payload))
    begin
      current_seller.update_product_level_support_emails!(normalized_product_level_support_emails(user_payload))
    rescue ActiveModel::ValidationError, StandardError => e
      Bugsnag.notify(e)
      message = "Something broke. We're looking into what happened. Sorry about this!"
      return handle_inertia_error(message)
    end

    render_main_page
  rescue ActiveRecord::RecordInvalid => e
    message = e.record.errors.full_messages.to_sentence
    handle_inertia_error(message)
  rescue StandardError => e
    Bugsnag.notify(e)
    message = current_seller.errors.full_messages.to_sentence.presence ||
      "Something broke. We're looking into what happened. Sorry about this!"
    handle_inertia_error(message)
  end

  def resend_confirmation_email
    if current_seller.unconfirmed_email.present? || !current_seller.confirmed?
      current_seller.send_confirmation_instructions
      return render json: { success: true }
    end
    render json: { success: false }
  end

  private
    def normalized_user_payload
      @normalized_user_payload ||= params.require(:user).to_unsafe_h.deep_symbolize_keys
    end

    def apply_refund_policy!(refund_policy_params)
      return if refund_policy_params.blank?

      current_seller.refund_policy.update!(
        max_refund_period_in_days: refund_policy_params[:max_refund_period_in_days],
        fine_print: refund_policy_params[:fine_print],
      )
    end

    def normalized_ppp_ids(user_payload)
      Array.wrap(user_payload[:purchasing_power_parity_excluded_product_ids]).filter_map(&:presence)
    end

    def normalized_product_level_support_emails(user_payload)
      Array.wrap(user_payload[:product_level_support_emails]).filter_map do |entry|
        next if entry.blank?

        email = entry[:email].to_s.strip
        product_ids = Array.wrap(entry[:product_ids]).filter_map(&:presence)
        next if email.blank? || product_ids.blank?

        { email:, product_ids: }
      end
    end

    def handle_inertia_error(message)
      redirect_to settings_main_path,
                  inertia: { errors: { error_message: message } },
                  alert: message,
                  status: :see_other
    end

    def render_main_page(status: :ok)
      render inertia: "Settings/Main", props: settings_presenter.main_props, status: status
    end

    def fetch_discover_sales(seller)
      PurchaseSearchService.search(
        seller:,
        price_greater_than: 0,
        recommended: true,
        state: "successful",
        exclude_bundle_product_purchases: true,
        aggs: { price_cents_total: { sum: { field: "price_cents" } } }
      ).aggregations["price_cents_total"]["value"]
    end

    def authorize
      super([:settings, :main, current_seller])
    end
end
