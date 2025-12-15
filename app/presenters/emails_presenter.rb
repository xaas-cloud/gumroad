# frozen_string_literal: true

class EmailsPresenter
  include Pagy::Backend

  attr_reader :seller, :tab, :installment

  def initialize(seller:, tab: nil, installment: nil)
    @seller = seller
    @tab = tab
    @installment = installment
  end

  def published_props
    {
      installments: paginated_presenter(Installment::PUBLISHED).props[:installments],
      pagination: paginated_presenter(Installment::PUBLISHED).props[:pagination],
      has_posts: has_posts?,
    }
  end

  def scheduled_props
    {
      installments: paginated_presenter(Installment::SCHEDULED).props[:installments],
      pagination: paginated_presenter(Installment::SCHEDULED).props[:pagination],
      has_posts: has_posts?,
    }
  end

  def drafts_props
    {
      installments: paginated_presenter(Installment::DRAFT).props[:installments],
      pagination: paginated_presenter(Installment::DRAFT).props[:pagination],
      has_posts: has_posts?,
    }
  end

  def new_page_props(copy_from: nil)
    InstallmentPresenter.new(seller:).new_page_props(copy_from:)
  end

  def edit_page_props
    InstallmentPresenter.new(seller:, installment:).edit_page_props
  end

  private
    def paginated_presenter(type)
      @paginated_presenter ||= {}
      @paginated_presenter[type] ||= PaginatedInstallmentsPresenter.new(seller:, type:, page: 1)
    end

    def has_posts?
      seller.installments.alive.not_workflow_installment.exists?
    end
end


