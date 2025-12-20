# frozen_string_literal: true

class EmailsController < Sellers::BaseController
  layout "inertia", only: [:published, :scheduled]

  before_action :set_body_id_as_app, only: [:index]

  def index
    authorize Installment

    if request.path == emails_path
      if current_seller.installments.alive.not_workflow_installment.scheduled.exists?
        return redirect_to scheduled_emails_path, status: :moved_permanently
      else
        return redirect_to published_emails_path, status: :moved_permanently
      end
    end
  end

  def published
    authorize Installment, :index?
    create_user_event("emails_view")

    @title = "Published Emails"
    presenter = PaginatedInstallmentsPresenter.new(seller: current_seller, type: Installment::PUBLISHED, page: 1)
    render inertia: "Emails/Published", props: presenter.props
  end

  def scheduled
    authorize Installment, :index?
    create_user_event("emails_view")

    @title = "Scheduled Emails"
    presenter = PaginatedInstallmentsPresenter.new(seller: current_seller, type: Installment::SCHEDULED, page: 1)
    render inertia: "Emails/Scheduled", props: presenter.props
  end


