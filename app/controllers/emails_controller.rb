# frozen_string_literal: true

class EmailsController < Sellers::BaseController
  layout "inertia"

  before_action :set_installment, only: %i[edit]

  def index
    authorize Installment


    if current_seller.installments.alive.ready_to_publish.exists?
      redirect_to emails_scheduled_path, status: :moved_permanently
    else
      redirect_to emails_published_path, status: :moved_permanently
    end
  end

  def published
    authorize Installment, :index?
    create_user_event("emails_view")

    presenter = EmailsPresenter.new(seller: current_seller)
    render inertia: "Emails/Published", props: presenter.published_props
  end

  def scheduled
    authorize Installment, :index?
    create_user_event("emails_view")

    presenter = EmailsPresenter.new(seller: current_seller)
    render inertia: "Emails/Scheduled", props: presenter.scheduled_props
  end

  def drafts
    authorize Installment, :index?
    create_user_event("emails_view")

    presenter = EmailsPresenter.new(seller: current_seller)
    render inertia: "Emails/Drafts", props: presenter.drafts_props
  end

  def new
    authorize Installment

    presenter = EmailsPresenter.new(seller: current_seller)
    render inertia: "Emails/New", props: presenter.new_page_props(copy_from: params[:copy_from])
  end

  def edit
    authorize @installment

    presenter = EmailsPresenter.new(seller: current_seller, installment: @installment)
    render inertia: "Emails/Edit", props: presenter.edit_page_props
  end

  private
    def set_title
      @title = "Emails"
    end

    def set_installment
      @installment = current_seller.installments.alive.find_by_external_id(params[:id])
      e404 unless @installment
    end
end
